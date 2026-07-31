import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../pages/migrated/theme";

interface Props {
  image?: string | null;
  size?: number;
}

/**
 * Miniatura cuadrada de ejercicio + insignia circular superpuesta
 * (esquina inferior derecha). No existe ningún asset de silueta muscular
 * en el proyecto (solo un `bodypart_ids` numérico sin resolver a nombre
 * en la API v2), así que la insignia usa un icono genérico en vez de
 * inventar una silueta por grupo muscular.
 */
function ExerciseThumb({ image, size = 56 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Ionicons name="barbell-outline" size={size * 0.4} color={C.gray40} />
        </View>
      )}
      <View style={styles.badge}>
        <Ionicons name="body-outline" size={11} color={C.white} />
      </View>
    </View>
  );
}

export const ExerciseThumbMem = React.memo(ExerciseThumb);

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: C.surface,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceLight,
  },
  badge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.brand60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.bg,
  },
});
