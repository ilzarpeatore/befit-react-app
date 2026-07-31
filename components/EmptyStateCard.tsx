import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, RADIUS, SPACING, SHADOW } from "@pages/migrated/theme";

interface Props {
  title?: string;
  message?: string;
}

// Tarjeta de estado vacío compacta, reutilizable dentro de listas (ej.
// "Tendencias"), no de pantalla completa. Patrón Bevel: icono "X" en
// círculo gris + título apagado + subtítulo. Ver Encargo2_Theme_Bevel.md
// sección 2.5.
export default function EmptyStateCard({
  title = "No hay datos",
  message = "No hay tendencias disponibles",
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="close" size={14} color={C.white} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.cardPadding,
    ...SHADOW.card,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.textTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: C.textSecondary,
  },
  message: {
    fontSize: 13,
    fontWeight: "500",
    color: C.textSecondary,
    marginTop: 2,
  },
});
