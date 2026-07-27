import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  variant: "google" | "facebook" | "email";
  label: string;
  onPress: () => void;
}

const ICONS: Record<Props["variant"], keyof typeof Ionicons.glyphMap> = {
  google: "logo-google",
  facebook: "logo-facebook",
  email: "mail-outline",
};

const BG_COLORS: Record<Props["variant"], string> = {
  google: "#FFFFFF",
  facebook: "#1877F2",
  email: Colors.BG_CARD,
};

const FG_COLORS: Record<Props["variant"], string> = {
  google: "#333333",
  facebook: "#FFFFFF",
  email: Colors.TEXT_PRIMARY,
};

export function AuthSocialButton({ variant, label, onPress }: Props) {
  const styles = useStyle();
  const bg = BG_COLORS[variant];
  const fg = FG_COLORS[variant];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: bg }]}
      onPress={onPress}
    >
      <Ionicons name={ICONS[variant]} size={22} color={fg} />
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: "56@ratio",
      borderRadius: "16@ratio",
      marginBottom: "12@ratio",
      gap: 10,
    },
    label: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
    },
  });
}
