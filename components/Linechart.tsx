import React, { useEffect, useMemo } from "react";
import { Easing, Platform } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import {
  Svg,
  Line,
  Defs,
  LinearGradient as SlinearGradient,
  Stop,
  Text as SText,
  G,
  Path,
} from "react-native-svg";
import { LinechartInterface } from "./_types/Linechart.i";
import { bezierCommand, svgPath } from "@helper/svg";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
const AnimatedPath = Animated.createAnimatedComponent(Path);
/**
 * Linechart
 */
export default function Linechart({ chartWidth, chartHeight, chartdata, chartdatamaxvalue, showAvg, showLabels, AnimateLine, showGrid }: LinechartInterface) {
  const styles = useStyle();
  /* chart data */
  const chartviewboxworkingwidth = styles.chartviewbox.width; //chart working area width (because of spacing, it's different from view box width)
  const chartviewboxworkingheight = styles.chartviewbox.height; //chart working area height (because of spacing, it's different from view box height)
  const PathAnim = useSharedValue(1000); // chart path anime
  const Ystartpoint = styles.chartviewbox.top; //starting Y position for chart to render
  const cropfixh = styles.chartviewbox.padding; // fixing line croping height
  const startX = styles.chartviewbox.left; // start x position for chart to render from viewbox
  const chart = useMemo(() => {
    const max = chartdatamaxvalue
      ? chartdatamaxvalue
      : chartdata
        .map((el) => el.value)
        .reduce((a, b) => Math.max(a, b), -Infinity); //finding max number from chart data values
    const sum = chartdata
      .map((el) => el.value)
      .reduce((a, b) => a + b, 0); // sum chart data values
    const avg = sum / chartdata.length || 0; // find chart data values avg
    const avgprecentage = (avg * 100) / max; // chart data value avg in precentage
    const avglinestartY = (avgprecentage * chartviewboxworkingheight) / 100; //finding avg line starting Y position
    const spacingX =
      (chartviewboxworkingwidth + startX) / chartdata.length; //spacing between each line
    let xstartpoint = startX; //starting x position for chart to render
    const parsedata: [number, number][] = []
    /* parse chart data */
    chartdata.map((data) => {
      //parsing chart values , turing values to x and Y positon
      let y =
        chartviewboxworkingheight -
        cropfixh -
        (data.value / max) * (chartviewboxworkingheight - cropfixh) +
        Ystartpoint;
      parsedata.push([xstartpoint, y] as [number, number]);
      xstartpoint += spacingX;
    });
    return {
      max,
      xstartpoint,
      spacingX,
      parsedata,
      avglinestartY
    }

  }, [chartdatamaxvalue, chartdata, chartviewboxworkingheight, chartviewboxworkingwidth, startX, cropfixh, Ystartpoint]);
  useEffect(() => {
    PathAnim.value = withTiming(0, { duration: 5000, easing: Easing.linear });
  }, [PathAnim])
  return (
    <Svg
      width={chartWidth}
      height={chartHeight}
      viewBox="0 0 302 171"
      fill="none"
    >
      {/*vertical lines*/}
      {chart.parsedata.map((data, i) => {
        return (
          <G key={i}>
            {/* grid */}
            {showGrid ? (
              <Line
                x1={data[0]}
                y1="-2.18557e-08"
                x2={data[0]}
                y2="171"
                stroke="url(#paint0_linear)"
                strokeDasharray="1 5"
              />
            ) : null}
            {/* label */}
            {showLabels ? (
              <SText
                fill="#6B6B70"
                fontSize="14"
                fontFamily={Platform.OS != "ios" ? "Gilroy-Bold" : ""} //ios fix | ios can't load fonts inside svg for some reason yet
                fontWeight="bold"
                x={data[0]}
                y="151"
                textAnchor="middle"
              >
                {chartdata[i].label}
              </SText>
            ) : null}
          </G>
        );
      })}

      {/*vertical lines*/}
      {/*avg line*/}
      {showAvg ? (
        <G>
          {/* line */}
          <Line
            x1="26.5"
            y1={chart.avglinestartY + Ystartpoint}
            x2="301.5"
            y2={chart.avglinestartY + Ystartpoint}
            stroke="#6B6B70"
            strokeOpacity="0.5"
            strokeLinecap="round"
            strokeDasharray="1 5"
          />
          {/* text */}
          <SText
            fill="#6B6B70"
            fontSize="10"
            fontFamily={Platform.OS != "ios" ? "Gilroy-Bold" : ""} //ios fix | ios can't load fonts inside svg for some reason yet
            fontWeight="bold"
            x="10"
            y={chart.avglinestartY + Ystartpoint}
            textAnchor="middle"
          >
            Avg.
          </SText>
        </G>
      ) : null}
      {/*avg line*/}
      {/*graph line*/}
      <AnimatedPath
        d={svgPath(chart.parsedata, bezierCommand)} //pas parse data to svg path function to return svg path d
        stroke="url(#paint7_linear)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={AnimateLine ? 1000 : 0}
        strokeDashoffset={AnimateLine ? PathAnim : undefined}
      />
      {/*graph dot lines*/}
      <AnimatedPath
        d={svgPath(chart.parsedata, bezierCommand)} //pas parse data to svg path function to return svg path d
        stroke="#1C1C1E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={"1 4"}
      />
      {/*gradients*/}
      <Defs>
        <SlinearGradient
          id="paint0_linear"
          x1="26"
          y1="171"
          x2="26"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#E5E5EA" />
          <Stop offset="0.0001" stopColor="#E5E5EA" stopOpacity="0" />
          <Stop offset="0.514034" stopColor="#E5E5EA" />
          <Stop offset="1" stopColor="#E5E5EA" stopOpacity="0" />
        </SlinearGradient>
        <SlinearGradient
          id="paint7_linear"
          x1="291"
          y1="42"
          x2="29.5"
          y2="123"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#1C1C1E" stopOpacity="0" />
          <Stop offset="0.179336" stopColor="#94CF76" />
          <Stop offset="0.803064" stopColor="#1C1C1E" />
          <Stop offset="1" stopColor="#1C1C1E" stopOpacity="0" />
        </SlinearGradient>
      </Defs>
    </Svg>
  );
}
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    chartviewbox: {
      width: '264@ratio',
      height: '70@ratio',
      left:'30@ratio',
      top:'50@ratio',
      padding:'5@ratio'
    }
  });
  return styles
}