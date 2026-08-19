import React, { useEffect, useState } from "react";
import { View, Animated } from "react-native";
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
  const [animatedWidth] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(Math.max(progress, 0), 100),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View>
      {showLabel && (
        <Animated.View style={styles.labelRow}>
          <Animated.Text style={styles.label}>
            {Math.round(clampedProgress)}%
          </Animated.Text>
        </Animated.View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fillWrapper,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              height,
            },
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
