import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

function EmptyState({ icon = "folder-open-outline", title, message }: Props) {
  const styles = useStyle();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={Colors.TEXT_MUTED} />
      <Text style={styles.title}>{title}</Text>
      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
    </View>
  );
}

export const EmptyStateMem = React.memo(EmptyState);

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: "32@ratio",
      paddingVertical: "48@ratio",
    },
    title: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
      textAlign: "center",
      marginTop: "16@ratio",
    },
    message: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
      textAlign: "center",
      marginTop: "8@ratio",
      lineHeight: "20@ratio",
    },
  });
}
