import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  progress: number;
  height?: number;
  showLabel?: boolean;
  colors?: [string, string];
}

function ProgressBar({
  progress,
  height = 8,
  showLabel = false,
  colors = [Colors.ACCENT_START, Colors.ACCENT_END],
}: Props) {
  const styles = useStyle();
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(Math.min(Math.max(progress, 0), 100), {
      duration: 600,
    });
  }, [progress]);

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fillWrapper,
            fillAnimatedStyle,
            { height },
          ]}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={colors}
            style={[styles.fill, { height, borderRadius: height / 2 }]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

export const ProgressBarMem = React.memo(ProgressBar);

function useStyle() {
  return useResponsiveStyleSheet({
    track: {
      width: "100%",
      backgroundColor: Colors.BG_CARD,
      borderRadius: "4@ratio",
      overflow: "hidden",
    },
    fillWrapper: {
      overflow: "hidden",
    },
    fill: {
      width: "100%",
    },
    labelRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: "4@ratio",
    },
    label: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
    },
  });
}
