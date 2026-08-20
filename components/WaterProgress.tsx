import React, { useEffect, useMemo } from "react";
import { View, Platform } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import {
  Svg,
  Defs,
  LinearGradient as SlinearGradient,
  Stop,
  Path,
  G,
  Circle,
  RadialGradient,
} from "react-native-svg";
import { WaterProgressInterface } from "./_types/WaterProgress.i";
const AnimatedG = Animated.createAnimatedComponent(G);
/**
 * WaterProgress
 */
export default function WaterProgress({ width, height, percent }: WaterProgressInterface) {
  /* chart data */
  const translateY = useMemo(() => {
    const waterY = (percent * 61) / 100; // water Y position
    const translateY = 31 - waterY; // water Y position - 0 position (31px)
    return translateY;
  }, [percent])
  const waterpercentanime = useSharedValue(31); // water Y position animation
  /* chart animation */
  useEffect(() => {
    waterpercentanime.value = withTiming(translateY, { duration: 500 });
  }, [translateY, waterpercentanime])

  const waterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: waterpercentanime.value }], // animate water to Y position
  }));
  return (
    <View
      style={{
        width: width,
        height: height,
        borderRadius: Platform.OS == "ios" ? 28 : 59, //ios fix
        overflow: "hidden",
      }}
    >
      <Svg
        width={width}
        height={height}
        viewBox="0 0 58 58"
        fill="none"
      >
        <G transform="translate(-2 0) scale(1.1)">
          <AnimatedG
            //@ts-ignore exits ... duh
            style={waterAnimatedStyle}
          >
            {/* water */}
            <Path
              d="M 28.571 27.5 C 43.071 18.5 56.571 27.5 56.571 27.5 L 57 85 L 1 85 L 1.071 27.5 C 1.071 27.5 14.071 36.5 28.571 27.5 Z"
              fill="#000000"
            />
            <Path
              d="M 29 27.5 C 14.5 18.5 1 27.5 1 27.5 L 1 85 L 57 85 L 56.5 27.5 C 56.5 27.5 43.5 36.5 29 27.5 Z"
              fill="url(#paint0_linear)"
            />
          </AnimatedG>
        </G>
        {/* water bg */}
        <Circle
          cx="29"
          cy="29"
          r="28"
          fill="url(#paint1_radial)"
          fillOpacity="0.2"
          stroke="url(#paint2_linear)"
          strokeWidth="2"
        />
        {/* gradients */}
        <Defs>
          <SlinearGradient
            id="paint0_linear"
            x1="28.7855"
            y1="23.5"
            x2="28.7855"
            y2="57"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#000000" />
            <Stop offset="1" stopColor="#000000" />
          </SlinearGradient>
          <RadialGradient
            id="paint1_radial"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(29 29) rotate(90) scale(28)"
          >
            <Stop stopColor="white" />
            <Stop offset="1" stopColor="white" stopOpacity="0.15" />
          </RadialGradient>
          <SlinearGradient
            id="paint2_linear"
            x1="16"
            y1="-9.5"
            x2="40.5"
            y2="53.5"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#E5E5EA" />
            <Stop offset="1" stopColor="#E5E5EA" stopOpacity="0" />
          </SlinearGradient>
        </Defs>
        {/* gradients */}
      </Svg>
    </View>
  );
}
