import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";

export default function LogWeightFormScreen({ navigation }: any) {


  const handleContinue = () => {
    navigation.navigate("MigratedLogWeightKeyboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.scaleIcon}>
          <Ionicons name="scale-outline" size={80} color={C.primary} />
        </View>

        <Text style={styles.weightDisplay}>70.0 kg</Text>
        <Text style={styles.subtitle}>Registrar peso</Text>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scaleIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  weightDisplay: {
    fontSize: 48,
    fontFamily: FONT.bold,
    color: C.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: C.gray,
    marginBottom: 48,
  },
  continueButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 60,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: C.white,
  },
});
