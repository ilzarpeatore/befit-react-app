import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, RADIUS } from "@pages/migrated/theme";

export type TriState = "no" | "neutral" | "yes";

interface Props {
  value: TriState;
  onChange: (value: TriState) => void;
}

const OPTIONS: { key: TriState; icon: keyof typeof Ionicons.glyphMap; activeColor: string }[] = [
  { key: "no", icon: "close", activeColor: C.statusDanger },
  { key: "neutral", icon: "remove", activeColor: C.gray40 },
  { key: "yes", icon: "checkmark", activeColor: C.statusInfo },
];

// Selector de 3 estados (X / − / ✓), patrón Bevel para hábitos del Diario.
// Tocar el estado ya activo lo vuelve a "neutral". Ver
// Encargo2_Theme_Bevel.md sección 2.6.
export default function TriStateToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const isActive = value === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.button, isActive && { backgroundColor: opt.activeColor }]}
            onPress={() => onChange(isActive ? "neutral" : opt.key)}
            activeOpacity={0.7}
          >
            <Ionicons name={opt.icon} size={18} color={isActive ? "#FFFFFF" : C.textTertiary} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: C.surfaceLight,
    borderRadius: RADIUS.sm,
    padding: 3,
    gap: 3,
  },
  button: {
    width: 44,
    height: 36,
    borderRadius: RADIUS.sm - 3,
    alignItems: "center",
    justifyContent: "center",
  },
});
