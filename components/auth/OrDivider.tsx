import React from "react";
import { View, Text } from "react-native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

export function OrDivider() {
  const styles = useStyle();

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>OR</Text>
      <View style={styles.line} />
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: "20@ratio",
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: Colors.TEXT_MUTED,
    },
    text: {
      fontFamily: "Gilroy-Medium",
      fontSize: "13@ratio",
      color: Colors.TEXT_MUTED,
      marginHorizontal: "16@ratio",
    },
  });
}
