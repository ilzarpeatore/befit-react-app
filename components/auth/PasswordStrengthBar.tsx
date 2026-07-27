import React from "react";
import { View, Text } from "react-native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { calcStrength, getStrengthLabel, getStrengthColor } from "../../types/registration";

interface Props {
  password: string;
}

export function PasswordStrengthBar({ password }: Props) {
  const styles = useStyle();
  const strength = calcStrength(password);
  const label = getStrengthLabel(strength);
  const color = getStrengthColor(strength);

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i <= strength && { backgroundColor: color },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: "8@ratio",
      marginBottom: "8@ratio",
      gap: 10,
    },
    track: {
      flex: 1,
      flexDirection: "row",
      gap: 4,
    },
    segment: {
      flex: 1,
      height: "4@ratio",
      borderRadius: 2,
      backgroundColor: Colors.TEXT_MUTED,
    },
    label: {
      fontFamily: "Gilroy-Medium",
      fontSize: "12@ratio",
    },
  });
}
