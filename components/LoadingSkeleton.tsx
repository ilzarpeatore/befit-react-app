import React, { useEffect, useState } from "react";
import { Animated } from "react-native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";

interface Props {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
}

function LoadingSkeleton({ width, height, borderRadius }: Props) {
  const styles = useStyle();
  const [pulse] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const containerStyle = [
    styles.skeleton,
    width != null ? { width } : undefined,
    height != null ? { height } : undefined,
    borderRadius != null ? { borderRadius } : undefined,
  ];

  return <Animated.View style={[containerStyle, { opacity: pulse }]} />;
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
