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
        d="M99.5 82C99.5 91.665 91.665 99.5 82 99.5V114.5C99.9493 114.5 114.5 99.9493 114.5 82H99.5ZM82 99.5C72.335 99.5 64.5 91.665 64.5 82H49.5C49.5 99.9493 64.0507 114.5 82 114.5V99.5ZM64.5 82C64.5 72.335 72.335 64.5 82 64.5V49.5C64.0507 49.5 49.5 64.0507 49.5 82H64.5ZM82 64.5C91.665 64.5 99.5 72.335 99.5 82H114.5C114.5 64.0507 99.9493 49.5 82 49.5V64.5Z"
        fill="#252543"
      />
      <AnimatedPath
        d="M82 57C85.283 57 88.5339 57.6466 91.5671 58.903C94.6002 60.1594 97.3562 62.0009 99.6777 64.3223C101.999 66.6438 103.841 69.3998 105.097 72.4329C106.353 75.4661 107 78.717 107 82C107 85.2831 106.353 88.534 105.097 91.5671C103.841 94.6002 101.999 97.3562 99.6777 99.6777C97.3562 101.999 94.6002 103.841 91.5671 105.097C88.5339 106.353 85.283 107 82 107C78.7169 107 75.466 106.353 72.4329 105.097C69.3998 103.841 66.6438 101.999 64.3223 99.6777C62.0009 97.3562 60.1594 94.6002 58.903 91.5671C57.6466 88.5339 57 85.283 57 82C57 78.7169 57.6466 75.466 58.903 72.4329C60.1594 69.3998 62.0009 66.6438 64.3223 64.3223C66.6438 62.0009 69.3998 60.1594 72.4329 58.903C75.4661 57.6466 78.717 57 82 57L82 57Z"
        stroke="url(#paint0_linear)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray={160}
        strokeDashoffset={Animate ? chartAnim[0] : chartOffsets[0]}
      />
      <Path
        d="M84 55.2679C85.3333 56.0377 86 56.4226 86 57C86 57.5774 85.3333 57.9623 84 58.7321L82.5 59.5981C81.1667 60.3679 80.5 60.7528 80 60.4641C79.5 60.1754 79.5 59.4056 79.5 57.866L79.5 56.134C79.5 54.5944 79.5 53.8246 80 53.5359C80.5 53.2472 81.1667 53.6321 82.5 54.4019L84 55.2679Z"
        fill="#141227"
        fillOpacity="0.5"
      />
      {/*red*/}
      <Path
        d="M126 82C126 106.301 106.301 126 82 126C57.6995 126 38 106.301 38 82C38 57.6995 57.6995 38 82 38C106.301 38 126 57.6995 126 82Z"
        stroke="#252543"
        strokeWidth="15"
      />
      <AnimatedPath
        d="M82 38C87.7782 38 93.4997 39.1381 98.8381 41.3493C104.176 43.5605 109.027 46.8015 113.113 50.8873C117.198 54.9731 120.439 59.8236 122.651 65.1619C124.862 70.5003 126 76.2218 126 82C126 87.7782 124.862 93.4998 122.651 98.8381C120.439 104.176 117.198 109.027 113.113 113.113C109.027 117.198 104.176 120.439 98.8381 122.651C93.4997 124.862 87.7781 126 82 126C76.2218 126 70.5002 124.862 65.1619 122.651C59.8236 120.439 54.9731 117.198 50.8873 113.113C46.8015 109.027 43.5605 104.176 41.3493 98.8381C39.1381 93.4997 38 87.7781 38 82C38 76.2218 39.1381 70.5002 41.3493 65.1619C43.5605 59.8236 46.8015 54.9731 50.8873 50.8873C54.9731 46.8015 59.8236 43.5605 65.162 41.3493C70.5003 39.1381 76.2219 38 82 38L82 38Z"
        stroke="url(#paint1_linear)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray={280}
        strokeDashoffset={Animate ? chartAnim[1] : chartOffsets[1]}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M82.512 35.9862C82.5417 35.1901 82.6443 34.7413 83 34.5359C83.5 34.2472 84.1667 34.6321 85.5 35.4019L87 36.268C88.3333 37.0378 89 37.4227 89 38C89 38.5774 88.3333 38.9623 87 39.7321L85.5 40.5981C84.1667 41.3679 83.5 41.7528 83 41.4641C82.6443 41.2588 82.5417 40.81 82.512 40.0138L81.5 40.5981C80.1667 41.3679 79.5 41.7528 79 41.4641C78.5 41.1754 78.5 40.4056 78.5 38.866V37.134C78.5 35.5944 78.5 34.8246 79 34.5359C79.5 34.2472 80.1667 34.6321 81.5 35.4019L82.512 35.9862Z"
        fill="#141227"
        fillOpacity="0.5"
      />
      {/*blue*/}
      <Path
        d="M145 82C145 116.794 116.794 145 82 145C47.2061 145 19 116.794 19 82C19 47.2061 47.2061 19 82 19C116.794 19 145 47.2061 145 82Z"
        stroke="#252543"
        strokeWidth="15"
      />
      <AnimatedPath
        d="M82 19C90.2733 19 98.4655 20.6295 106.109 23.7956C113.753 26.9616 120.698 31.6022 126.548 37.4523C132.398 43.3024 137.038 50.2474 140.204 57.891C143.37 65.5345 145 73.7267 145 82C145 90.2733 143.37 98.4656 140.204 106.109C137.038 113.753 132.398 120.698 126.548 126.548C120.698 132.398 113.753 137.038 106.109 140.204C98.4655 143.37 90.2733 145 82 145C73.7267 145 65.5344 143.37 57.8909 140.204C50.2474 137.038 43.3023 132.398 37.4523 126.548C31.6022 120.698 26.9616 113.753 23.7956 106.109C20.6295 98.4655 19 90.2732 19 82C19 73.7267 20.6296 65.5344 23.7956 57.8909C26.9617 50.2474 31.6022 43.3023 37.4523 37.4522C43.3024 31.6022 50.2475 26.9616 57.891 23.7956C65.5345 20.6295 73.7268 19 82 19L82 19Z"
        stroke="url(#paint2_linear)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray={400}
        strokeDashoffset={Animate ? chartAnim[2] : chartOffsets[2]}
      />
      <Path
        d="M84 17.2679C85.3333 18.0377 86 18.4226 86 19C86 19.5774 85.3333 19.9623 84 20.7321L82.5 21.5981C81.1667 22.3679 80.5 22.7528 80 22.4641C79.5 22.1754 79.5 21.4056 79.5 19.866L79.5 18.134C79.5 16.5944 79.5 15.8246 80 15.5359C80.5 15.2472 81.1667 15.6321 82.5 16.4019L84 17.2679Z"
        fill="#141227"
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
          <Stop stopColor="#818DFA" />
          <Stop offset="1" stopColor="#505EDC" />
        </SlinearGradient>
      </Defs>
    </Svg>
  );
}
