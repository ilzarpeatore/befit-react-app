import React, { useEffect, useMemo, useState } from "react";
import { Animated, Easing } from "react-native";
import {
  Svg,
  Line,
  Defs,
  LinearGradient as SlinearGradient,
  Stop,
  Path,
  G,
} from "react-native-svg";
import { Linechart2Interface } from "./_types/Linechart2.i";
import { bezierCommand, svgPath } from "@helper/svg";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
const AnimatedPath = Animated.createAnimatedComponent(Path);
/**
 * Linechart2
 */
export default function Linechart2({ chartWidth, chartHeight, chartdata, chartdatamaxvalue, AnimateLine, showGrid }: Linechart2Interface) {
  const styles = useStyle();
  /* chart data */
  const chartviewboxworkingwidth = styles.chartviewbox.width;
  const chartviewboxworkingheight = styles.chartviewbox.height;
  const [PathAnim] = useState(() => new Animated.Value(500));
  const chart = useMemo(() => {
    const max = chartdatamaxvalue ? chartdatamaxvalue : chartdata.reduce((a, b) => Math.max(a, b), -Infinity); //finding max number from chart data values
    const parsedata: [number, number][] = []; // chart data value parse
    const spacingX = chartviewboxworkingwidth / (chartdata.length - 1); //spacing between each line
    let xstartpoint = 0; //starting x position for chart to render
    // chart path anime
    /* parse chart data */
    chartdata.map((data, i) => {
      //parsing chart values , turing values to x and Y positon
      let y =
        chartviewboxworkingheight - (data / max) * chartviewboxworkingheight;
      parsedata.push([xstartpoint, y] as [number, number]);
      xstartpoint += spacingX;
    });
    const chartpath = svgPath(parsedata, bezierCommand)//pas parse data to svg path function to return svg path d
    return {
      parsedata,
      chartpath
    }
  }, [chartdatamaxvalue, chartdata]);

  useEffect(() => {
    Animated.timing(PathAnim, {
      toValue: 0,
      duration: 5000,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }, [])

  return (
  <Svg
    width={chartWidth}
    height={chartHeight}
    viewBox="0 0 165 164"
    fill="none"
    style={{ marginTop: -20 }}
  >
    {/* chart path */}
    <AnimatedPath
      d={chart.chartpath}
      stroke="url(#paint0_linear)"
      strokeWidth="2"
      strokeDasharray={AnimateLine ? 500 : 0}
      strokeDashoffset={AnimateLine ? PathAnim : undefined}
    />
    {/* chart path background gradient */}
    <Path
      opacity="0.1"
      d={chart.chartpath + ` V 162 H 0 V ${chart.parsedata[0]}`}
      fill="url(#paint1_linear)"
    />
    {/* chart grid */}
    {showGrid ? (
      <G>
        <Line
          x1="40.5"
          x2="40.5"
          y2="164"
          stroke="url(#paint2_linear)"
          strokeDasharray="1 5"
        />
        <Line
          x1="82.5"
          x2="82.5"
          y2="164"
          stroke="url(#paint3_linear)"
          strokeDasharray="1 5"
        />
        <Line
          x1="124.5"
          x2="124.5"
          y2="164"
          stroke="url(#paint4_linear)"
          strokeDasharray="1 5"
        />
      </G>
    ) : null}

    {/* chart grid */}
    {/* gradients */}
    <Defs>
      <SlinearGradient
        id="paint0_linear"
        x1="164"
        y1="50"
        x2="4.5"
        y2="107.5"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1C1C1E" stopOpacity="0" />
        <Stop offset="0.261464" stopColor="#1C1C1E" />
        <Stop offset="0.706385" stopColor="#1C1C1E" />
        <Stop offset="1" stopColor="#1C1C1E" stopOpacity="0" />
      </SlinearGradient>
      <SlinearGradient
        id="paint1_linear"
        x1="82.75"
        y1="71"
        x2="82.75"
        y2="162"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#000000" />
        <Stop offset="1" stopColor="#000000" stopOpacity="0" />
      </SlinearGradient>
      <SlinearGradient
        id="paint2_linear"
        x1="40"
        y1="164"
        x2="40"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#E5E5EA" />
        <Stop offset="0.0001" stopColor="#E5E5EA" stopOpacity="0" />
        <Stop offset="0.514034" stopColor="#E5E5EA" />
        <Stop offset="1" stopColor="#E5E5EA" stopOpacity="0" />
      </SlinearGradient>
      <SlinearGradient
        id="paint3_linear"
        x1="82"
        y1="164"
        x2="82"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#E5E5EA" />
        <Stop offset="0.0001" stopColor="#E5E5EA" stopOpacity="0" />
        <Stop offset="0.514034" stopColor="#E5E5EA" />
        <Stop offset="1" stopColor="#E5E5EA" stopOpacity="0" />
      </SlinearGradient>
      <SlinearGradient
        id="paint4_linear"
        x1="124"
        y1="164"
        x2="124"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#E5E5EA" />
        <Stop offset="0.0001" stopColor="#E5E5EA" stopOpacity="0" />
        <Stop offset="0.514034" stopColor="#E5E5EA" />
        <Stop offset="1" stopColor="#E5E5EA" stopOpacity="0" />
      </SlinearGradient>
    </Defs>
    {/* gradients */}
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
      width: '165@ratio',
      height: '164@ratio',
    }
  });
  return styles
}