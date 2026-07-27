import React from "react";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AuthPrimaryButton({ label, onPress, loading = false, disabled = false }: Props) {
  const styles = useStyle();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, disabled && styles.disabled]}
    >
      <LinearGradient
        start={{ x: 0.24, y: -0.09 }}
        end={{ x: 0.5, y: 1 }}
        colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={Colors.TEXT_PRIMARY} size="small" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      width: "100%",
      height: "56@ratio",
      borderRadius: "16@ratio",
      overflow: "hidden",
    },
    gradient: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "16@ratio",
    },
    label: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
