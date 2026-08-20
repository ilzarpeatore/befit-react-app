import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";

interface Props {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
}

function LoadingSkeleton({ width, height, borderRadius }: Props) {
  const styles = useStyle();
  const pulse = useSharedValue(0.3);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const containerStyle = [
    styles.skeleton,
    width != null ? { width } : undefined,
    height != null ? { height } : undefined,
    borderRadius != null ? { borderRadius } : undefined,
  ];

  return <Animated.View style={[containerStyle, pulseStyle]} />;
}

export const LoadingSkeletonMem = React.memo(LoadingSkeleton);

function useStyle() {
  return useResponsiveStyleSheet({
    skeleton: {
      width: "100%",
      height: "20@ratio",
      backgroundColor: "#1E1B3A",
      borderRadius: "8@ratio",
    },
  });
}
