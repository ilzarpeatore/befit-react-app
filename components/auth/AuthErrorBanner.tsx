import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  message: string;
  onDismiss?: () => void;
}

export function AuthErrorBanner({ message, onDismiss }: Props) {
  const styles = useStyle();

  return (
    <View style={styles.container}>
      <Ionicons name="information-circle-outline" size={20} color={Colors.DANGER} />
      <Text style={styles.message} numberOfLines={3}>{message}</Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} style={({ pressed }) => pressed && { opacity: 0.2 }}>
          <Ionicons name="close" size={18} color={Colors.DANGER} />
        </Pressable>
      )}
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(248,83,101,0.1)",
      borderRadius: "12@ratio",
      padding: "14@ratio",
      marginBottom: "16@ratio",
      gap: 10,
    },
    message: {
      flex: 1,
      fontFamily: "Gilroy-Medium",
      fontSize: "14@ratio",
      color: Colors.DANGER,
    },
  });
}
