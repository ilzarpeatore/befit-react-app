import React from "react";
import { Text, Pressable, View } from "react-native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  prefix: string;
  linkText: string;
  onPress: () => void;
}

export function AuthLinkRow({ prefix, linkText, onPress }: Props) {
  const styles = useStyle();

  return (
    <View style={styles.container}>
      <Text style={styles.prefix}>{prefix} </Text>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.2 }}>
        <Text style={styles.link}>{linkText}</Text>
      </Pressable>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "20@ratio",
    },
    prefix: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    link: {
      fontFamily: "Gilroy-Bold",
      fontSize: "14@ratio",
      color: Colors.TEXT_PRIMARY,
    },
  });
}
