import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing } from "react-native";
import {
  Svg,
  Defs,
  LinearGradient as SlinearGradient,
  Stop,
  Path,
} from "react-native-svg";
import { PiechartInterface } from "./_types/Piechart.i";
const AnimatedPath = Animated.createAnimatedComponent(Path);
/**
 * Piechart
 * @param chartWidth : pie chart width | type : integer
 * @param chartHeight : pie chart height | type : integer
 * @param chartdata : pie chart data | type : array of chart value length of 3 | key 0 for yellow circle , key 1 for red circle , key 2 for blue circle | example : [30, 80, 60]
 * @param Animate : enable pie animate | type : bool
 * @returns
 */
export default function Piechart({ chartWidth, chartHeight, chartdata, Animate }: PiechartInterface) {
  /* chart data */
  const chartAnim = useRef([
    new Animated.Value(160),
    new Animated.Value(280),
    new Animated.Value(400),
  ]).current;
  const chartOffsets = useMemo(() => [
    ((100 - chartdata[0]) * 160) / 100,
    ((100 - chartdata[1]) * 280) / 100,
    ((100 - chartdata[2]) * 400) / 100,
  ], [chartdata]);
  /* chart animation */
  useEffect(() => {
    Animated.timing(chartAnim[0], {
      toValue: chartOffsets[0],
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
    Animated.timing(chartAnim[1], {
      toValue: chartOffsets[1],
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
    Animated.timing(chartAnim[2], {
      toValue: chartOffsets[2],
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }, [chartOffsets])
  return (
    <Svg
      width={chartWidth}
      height={chartHeight}
      viewBox="0 0 164 164"
      fill="none"
    >
      {/*yellow*/}
      <Path
        d="M99.5 82C99.5 91.67 91.67 99.5 82 99.5V114.5C99.95 114.5 114.5 99.95 114.5 82H99.5ZM82 99.5C72.34 99.5 64.5 91.67 64.5 82H49.5C49.5 99.95 64.05 114.5 82 114.5V99.5ZM64.5 82C64.5 72.34 72.34 64.5 82 64.5V49.5C64.05 49.5 49.5 64.05 49.5 82H64.5ZM82 64.5C91.67 64.5 99.5 72.34 99.5 82H114.5C114.5 64.05 99.95 49.5 82 49.5V64.5Z"
        fill="#E5E5EA"
      />
      <AnimatedPath
        d="M82 57C85.28 57 88.53 57.65 91.57 58.9C94.6 60.16 97.36 62 99.68 64.32C102 66.64 103.84 69.4 105.1 72.43C106.35 75.47 107 78.72 107 82C107 85.28 106.35 88.53 105.1 91.57C103.84 94.6 102 97.36 99.68 99.68C97.36 102 94.6 103.84 91.57 105.1C88.53 106.35 85.28 107 82 107C78.72 107 75.47 106.35 72.43 105.1C69.4 103.84 66.64 102 64.32 99.68C62 97.36 60.16 94.6 58.9 91.57C57.65 88.53 57 85.28 57 82C57 78.72 57.65 75.47 58.9 72.43C60.16 69.4 62 66.64 64.32 64.32C66.64 62 69.4 60.16 72.43 58.9C75.47 57.65 78.72 57 82 57L82 57Z"
        stroke="url(#paint0_linear)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray={160}
        strokeDashoffset={Animate ? chartAnim[0] : chartOffsets[0]}
      />
      <Path
        d="M84 55.27C85.33 56.04 86 56.42 86 57C86 57.58 85.33 57.96 84 58.73L82.5 59.6C81.17 60.37 80.5 60.75 80 60.46C79.5 60.18 79.5 59.41 79.5 57.87L79.5 56.13C79.5 54.59 79.5 53.82 80 53.54C80.5 53.25 81.17 53.63 82.5 54.4L84 55.27Z"
        fill="#1C1C1E"
        fillOpacity="0.5"
      />
      {/*red*/}
      <Path
        d="M126 82C126 106.3 106.3 126 82 126C57.7 126 38 106.3 38 82C38 57.7 57.7 38 82 38C106.3 38 126 57.7 126 82Z"
        stroke="#E5E5EA"
        strokeWidth="15"
      />
      <AnimatedPath
        d="M82 38C87.78 38 93.5 39.14 98.84 41.35C104.18 43.56 109.03 46.8 113.11 50.89C117.2 54.97 120.44 59.82 122.65 65.16C124.86 70.5 126 76.22 126 82C126 87.78 124.86 93.5 122.65 98.84C120.44 104.18 117.2 109.03 113.11 113.11C109.03 117.2 104.18 120.44 98.84 122.65C93.5 124.86 87.78 126 82 126C76.22 126 70.5 124.86 65.16 122.65C59.82 120.44 54.97 117.2 50.89 113.11C46.8 109.03 43.56 104.18 41.35 98.84C39.14 93.5 38 87.78 38 82C38 76.22 39.14 70.5 41.35 65.16C43.56 59.82 46.8 54.97 50.89 50.89C54.97 46.8 59.82 43.56 65.16 41.35C70.5 39.14 76.22 38 82 38L82 38Z"
        stroke="url(#paint1_linear)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray={280}
        strokeDashoffset={Animate ? chartAnim[1] : chartOffsets[1]}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M82.51 35.99C82.54 35.19 82.64 34.74 83 34.54C83.5 34.25 84.17 34.63 85.5 35.4L87 36.27C88.33 37.04 89 37.42 89 38C89 38.58 88.33 38.96 87 39.73L85.5 40.6C84.17 41.37 83.5 41.75 83 41.46C82.64 41.26 82.54 40.81 82.51 40.01L81.5 40.6C80.17 41.37 79.5 41.75 79 41.46C78.5 41.18 78.5 40.41 78.5 38.87V37.13C78.5 35.59 78.5 34.82 79 34.54C79.5 34.25 80.17 34.63 81.5 35.4L82.51 35.99Z"
        fill="#1C1C1E"
        fillOpacity="0.5"
      />
      {/*blue*/}
      <Path
        d="M145 82C145 116.79 116.79 145 82 145C47.21 145 19 116.79 19 82C19 47.21 47.21 19 82 19C116.79 19 145 47.21 145 82Z"
        stroke="#E5E5EA"
        strokeWidth="15"
      />
      <AnimatedPath
        d="M82 19C90.27 19 98.47 20.63 106.11 23.8C113.75 26.96 120.7 31.6 126.55 37.45C132.4 43.3 137.04 50.25 140.2 57.89C143.37 65.53 145 73.73 145 82C145 90.27 143.37 98.47 140.2 106.11C137.04 113.75 132.4 120.7 126.55 126.55C120.7 132.4 113.75 137.04 106.11 140.2C98.47 143.37 90.27 145 82 145C73.73 145 65.53 143.37 57.89 140.2C50.25 137.04 43.3 132.4 37.45 126.55C31.6 120.7 26.96 113.75 23.8 106.11C20.63 98.47 19 90.27 19 82C19 73.73 20.63 65.53 23.8 57.89C26.96 50.25 31.6 43.3 37.45 37.45C43.3 31.6 50.25 26.96 57.89 23.8C65.53 20.63 73.73 19 82 19L82 19Z"
        stroke="url(#paint2_linear)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray={400}
        strokeDashoffset={Animate ? chartAnim[2] : chartOffsets[2]}
      />
      <Path
        d="M84 17.27C85.33 18.04 86 18.42 86 19C86 19.58 85.33 19.96 84 20.73L82.5 21.6C81.17 22.37 80.5 22.75 80 22.46C79.5 22.18 79.5 21.41 79.5 19.87L79.5 18.13C79.5 16.59 79.5 15.82 80 15.54C80.5 15.25 81.17 15.63 82.5 16.4L84 17.27Z"
        fill="#1C1C1E"
        fillOpacity="0.5"
      />
      <Defs>
        <SlinearGradient
          id="paint0_linear"
          x1="82"
          y1="57"
          x2="104.5"
          y2="95.5"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FDD87C" />
          <Stop offset="1" stopColor="#FFCB46" />
        </SlinearGradient>
        <SlinearGradient
          id="paint1_linear"
          x1="82"
          y1="38"
          x2="43"
          y2="70.5"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FE98B9" />
          <Stop offset="1" stopColor="#FB558B" />
        </SlinearGradient>
        <SlinearGradient
          id="paint2_linear"
          x1="82"
          y1="19"
          x2="82"
          y2="145"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#1C1C1E" />
          <Stop offset="1" stopColor="#000000" />
        </SlinearGradient>
      </Defs>
    </Svg>
  );
}
