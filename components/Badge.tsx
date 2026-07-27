import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  count: number;
  size?: number;
}

function Badge({ count, size = 20 }: Props) {
  const styles = useStyle();

  if (count <= 0) return null;

  const displayCount = count > 99 ? "99+" : String(count);

  return (
    <LinearGradient
      start={{ x: 0.24, y: -0.09 }}
      end={{ x: 0.5, y: 1 }}
      colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: size * 0.5 },
        ]}
      >
        {displayCount}
      </Text>
    </LinearGradient>
  );
}

export const BadgeMem = React.memo(Badge);

function useStyle() {
  return useResponsiveStyleSheet({
    badge: {
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontFamily: "Gilroy-Bold",
      color: Colors.TEXT_PRIMARY,
    },
  });
}
