import React, { useEffect, useMemo, useState } from "react";
import { Animated, Platform } from "react-native";
import {
  Svg,
  Line,
  Defs,
  LinearGradient as SlinearGradient,
  Stop,
  Text as SText,
  G,
} from "react-native-svg";
import { BarchartInterface } from "./_types/Barchart.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedSText = Animated.createAnimatedComponent(SText);
/**
 * Barchart
 */
function Barchart({ chartWidth, chartHeight, chartBarstrokeWidth, chartdata, showAvg, showLabels, AnimateBar }: BarchartInterface) {
  const styles = useStyle();
  /* chart data */
  const chartviewboxworkingwidth = styles.chartviewbox.width; //chart working area width (because of spacing, it's different from view box width)
  const chartviewboxworkingheight = styles.chartviewbox.height; //chart working area height (because of spacing, it's different from view box height)
  const [avglinestartAnimY] = useState(() => new Animated.Value(64)); // chart avg line anime
  const startpoint = styles.chartviewbox.borderLeftWidth; //starting x position for chart to render
  const chart = useMemo(() => {
    const max = chartdata
      .map((el) => el.value)
      .reduce((a, b) => Math.max(a, b), -Infinity); //finding max number from chart data values
    const sum = chartdata
      .map((el) => el.value)
      .reduce((a, b) => a + b, 0); // sum chart data values
    const avg = sum / chartdata.length || 0; // find chart data values avg
    const avgprecentage = (avg * 100) / max; // chart data value avg in precentage
    const avgprecentaget = 100 - avgprecentage; // avgprecentage fliped
    const avglinestartY = (avgprecentaget * chartviewboxworkingheight) / 100; //finding avg line starting Y position
    const spacingX =
      (chartviewboxworkingwidth -
        chartBarstrokeWidth * chartdata.length) /
      chartdata.length +
      chartBarstrokeWidth; //spacing between each bar
    const roundcropingfix = chartBarstrokeWidth / 2; // fixing bar croping
    return {
      avglinestartY,
      max,
      roundcropingfix,
      spacingX
    }
  }, [chartdata, chartBarstrokeWidth])

  useEffect(() => {
    Animated.timing(avglinestartAnimY, {
      toValue: chart.avglinestartY,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [chart.avglinestartY])

  return (
    <Svg
      width={chartWidth}
      height={chartHeight}
      viewBox="0 0 302 109"
      fill="none"
    >
      {/*vertical line*/}
      {chartdata.map((data, i) => {
        let percentage = (data.value * 100) / chart.max, // chart value in precentage
          percentaget = 100 - percentage, // chart value in precentage fliped
          Y =
            (percentaget * chartviewboxworkingheight) / 100 + chart.roundcropingfix, // chart value Y position
          startpointX = i != 0 ? startpoint + chart.spacingX * i : startpoint, // x position of chart value
          animeY = new Animated.Value(69); // chart bar anime
        Animated.timing(animeY, {
          toValue: Y,
          duration: 500,
          useNativeDriver: true,
        }).start();
        return (
          <G key={i}>
            {/* bar background */}
            <Line
              x1={startpointX}
              y1="5"
              x2={startpointX}
              y2="69"
              stroke="url(#paint0_linear)"
              strokeOpacity="0.15"
              strokeWidth={chartBarstrokeWidth}
              strokeLinecap="round"
            />
            {/* bar */}
            <AnimatedLine
              x1={startpointX}
              y1={AnimateBar ? animeY : Y}
              x2={startpointX}
              y2="69"
              stroke={`url(#paint${i + 1}_linear)`}
              strokeWidth={chartBarstrokeWidth}
              strokeLinecap="round"
            />
            {/* label */}
            {showLabels ? (
              <SText
                fill="#6B6B70"
                fontSize="14"
                fontFamily={Platform.OS != "ios" ? "Gilroy-Bold" : ""} //ios fix | ios can't load fonts inside svg for some reason yet
                fontWeight="bold"
                x={startpointX}
                y="105"
                textAnchor="middle"
              >
                {data.label}
              </SText>
            ) : null}
          </G>
        );
      })}

      {/*avg line*/}
      {showAvg ? (
        <G>
          {/* line */}
          <AnimatedLine
            x1="26.5"
            y1={Platform.OS == "ios" ? chart.avglinestartY : avglinestartAnimY}
            x2="301.5"
            y2={Platform.OS == "ios" ? chart.avglinestartY : avglinestartAnimY}
            stroke="#6B6B70"
            strokeOpacity="0.5"
            strokeLinecap="round"
            strokeDasharray="1 5"
          />
          {/* label */}
          <AnimatedSText
            fill="#6B6B70"
            fontSize="10"
            fontFamily={Platform.OS != "ios" ? "Gilroy-Bold" : ""} //ios fix | ios can't load fonts inside svg for some reason yet
            fontWeight="bold"
            x="10"
            y={avglinestartAnimY}
            textAnchor="middle"
          >
            Avg.
          </AnimatedSText>
        </G>
      ) : null}
      {/*avg line*/}
      {/*gradients*/}
      <Defs>
        <SlinearGradient
          id="paint0_linear"
          x1="20"
          y1="74"
          x2="20"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.00323008" stopColor="#E5E5EA" stopOpacity="0.2" />
          <Stop offset="1" stopColor="#E5E5EA" />
        </SlinearGradient>
        {chartdata.map((data, i) => {
          /* bar gradient for each data value is unique */
          let percentage = (data.value * 100) / chart.max, // chart value in precentage
            percentaget = 100 - percentage, // chart value in precentage fliped
            Y =
              (percentaget * chartviewboxworkingheight) / 100 +
              chart.roundcropingfix; // chart value Y position
          return (
            <SlinearGradient
              key={i}
              id={`paint${i + 1}_linear`}
              x1="20"
              y1="74"
              x2="20"
              y2={Y}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0.00323008" stopColor="#1C1C1E" />
              <Stop offset="1" stopColor="#000000" />
            </SlinearGradient>
          );
        })}
      </Defs>
      {/*gradients*/}
    </Svg>
  );
}
/**
 * return as memo
 */
export const BarchartMem = React.memo(Barchart);
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    chartviewbox: {
      width: '284@ratio',
      height: '64@ratio',
      borderLeftWidth:'30@ratio'
    }
  });
  return styles
}