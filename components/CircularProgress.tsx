import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { Image } from "expo-image";
import {
  Svg,
  Defs,
  LinearGradient as SlinearGradient,
  Stop,
  Circle,
} from "react-native-svg";
import { CircularProgressInterface } from "./_types/CircularProgress.i";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
/**
 * CircularProgress
 */
function CircularProgress({ width, height, percent, icon }: CircularProgressInterface) {
  const styles = useStyle();
  /* chart data */
  const weightpercentageanime = useSharedValue(100);
  /* chart animation */
  useEffect(() => {
    weightpercentageanime.value = withTiming(100 - percent, { duration: 500 });
  }, [percent, weightpercentageanime])
  return (
    <View>
      <Image
        source={require("./../assets/challenges/progressbg.png")}
        contentFit="contain"
        style={styles.chartdataprogressbg}
      />
      <Image source={icon} contentFit="contain" style={styles.chartdataprogressicon} />
      <Svg
        width={width}
        height={height}
        viewBox="0 0 35 35"
        fill="none"
        style={styles.chartdataprogresssvg}
      >
        <AnimatedCircle
          cx="17"
          cy="17"
          r="15.5"
          fill="transparent"
          stroke="url(#paint0_linear)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="98"
          strokeDashoffset={weightpercentageanime}
        />
        <Defs>
          <SlinearGradient
            id="paint0_linear"
            x1="17"
            y1="2.00012"
            x2="27"
            y2="27.5001"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#1C1C1E" />
            <Stop offset="1" stopColor="#F85365" />
          </SlinearGradient>
        </Defs>
      </Svg>
    </View>
  );
}
/**
 * return as memo
 */
export const CircularProgressMem = React.memo(CircularProgress);
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    chartdataprogressbg: {
      position: "absolute",
      width: '56@ratio',
      height: '56@ratio',
      top: 0,
      right: 0,
    },
    chartdataprogresssvg: {
      marginTop: '-2@ratio',
      transform: [{ rotate: "-90deg" }],
    },
    chartdataprogressicon: {
      position: "absolute",
      width: '24@ratio',
      height: '24@ratio',
      top: "50%",
      left: "50%",
      marginLeft: '-12@ratio',
      marginTop: '-12@ratio',
    },
  });
  return styles
}
/**
 * style
 * * you can remove this const
 * * use this style if you don't want to use ratio
 */
const styles_old = StyleSheet.create({
  chartdataprogressbg: {
    position: "absolute",
    width: 56,
    height: 56,
    top: 0,
    right: 0,
    resizeMode: "contain",
  },
  chartdataprogresssvg: {
    marginTop: -2,
    transform: [{ rotate: "-90deg" }],
  },
  chartdataprogressicon: {
    position: "absolute",
    width: 24,
    height: 24,
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -12,
    resizeMode: "contain",
  },
});
