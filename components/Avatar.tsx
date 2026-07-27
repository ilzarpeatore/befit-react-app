import React from "react";
import { Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  uri?: string;
  name?: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

function Avatar({ uri, name = "", size = 48 }: Props) {
  const styles = useStyle();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  return (
    <LinearGradient
      start={{ x: 0.24, y: -0.09 }}
      end={{ x: 0.5, y: 1 }}
      colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </LinearGradient>
  );
}

export const AvatarMem = React.memo(Avatar);

function useStyle() {
  return useResponsiveStyleSheet({
    image: {
      resizeMode: "cover",
    },
    circle: {
      alignItems: "center",
      justifyContent: "center",
    },
    initials: {
      fontFamily: "Gilroy-Bold",
      color: Colors.TEXT_PRIMARY,
    },
  });
}
