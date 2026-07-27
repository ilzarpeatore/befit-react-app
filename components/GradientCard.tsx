import React from "react";
import { TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  variant?: "default" | "accent" | "dark";
}

const GRADIENT_COLORS: Record<NonNullable<Props["variant"]>, [string, string]> = {
  default: [Colors.CARD_START, Colors.CARD_END],
  accent: [Colors.ACCENT_START, Colors.ACCENT_END],
  dark: [Colors.BG_CARD, Colors.BG_CARD],
};

function GradientCard({ children, onPress, style, variant = "default" }: Props) {
  const styles = useStyle();
  const colors = GRADIENT_COLORS[variant];

  const content = (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={colors}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export const GradientCardMem = React.memo(GradientCard);

function useStyle() {
  return useResponsiveStyleSheet({
    card: {
      borderRadius: "16@ratio",
      padding: "16@ratio",
    },
  });
}
