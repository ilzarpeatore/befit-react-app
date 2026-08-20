import React from "react";
import { Text, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export function ForgotOptionTile({ icon, label, onPress }: Props) {
  const styles = useStyle();

  return (
    <Pressable style={({ pressed }) => [styles.container, pressed && { opacity: 0.2 }]} onPress={onPress}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[Colors.CARD_START, Colors.CARD_END]}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={28} color={Colors.TEXT_PRIMARY} />
        </View>
        <Text style={styles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.TEXT_SECONDARY} />
      </LinearGradient>
    </Pressable>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      marginBottom: "12@ratio",
    },
    gradient: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: "16@ratio",
      padding: "18@ratio",
    },
    iconContainer: {
      width: "48@ratio",
      height: "48@ratio",
      borderRadius: "24@ratio",
      backgroundColor: "rgba(119,115,250,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "14@ratio",
    },
    label: {
      flex: 1,
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
    },
  });
}
