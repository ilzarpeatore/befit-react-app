import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";

interface Props {
  size?: number;
}

export function SandowLogo({ size = 60 }: Props) {
  const styles = useStyle();
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.letter, { fontSize: size * 0.5 }]}>S</Text>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#E3DCD9",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    letter: {
      fontFamily: "Gilroy-ExtraBold",
      color: "#1C1C1E",
      fontSize: 30,
    },
  });
}
