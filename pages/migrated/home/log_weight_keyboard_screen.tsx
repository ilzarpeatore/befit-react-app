import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "backspace"],
];

export default function LogWeightKeyboardScreen({ navigation }: any) {

  const [weight, setWeight] = useState("70.0");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  const handleKeyPress = (key: string) => {
    if (key === "backspace") {
      setWeight((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (key === ".") {
      if (!weight.includes(".")) {
        setWeight((prev) => prev + ".");
      }
    } else {
      setWeight((prev) => (prev === "0" ? key : prev + key));
    }
  };

  const handleConfirm = () => {
    Alert.alert("Ã‰xito", "Peso registrado correctamente", [
      { text: "OK", onPress: () => navigation.navigate("MigratedWeightLogged") },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.weightSection}>
          <Text style={styles.weightDisplay}>{weight}</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === "lbs" && styles.unitBtnActive]}
              onPress={() => setUnit("lbs")}
            >
              <Text
                style={[
                  styles.unitText,
                  unit === "lbs" && styles.unitTextActive,
                ]}
              >
                lbs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === "kg" && styles.unitBtnActive]}
              onPress={() => setUnit("kg")}
            >
              <Text
                style={[
                  styles.unitText,
                  unit === "kg" && styles.unitTextActive,
                ]}
              >
                kg
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.changeIndicator}>
          <Ionicons name="trending-down" size={16} color="#4CAF50" />
          <Text style={styles.changeText}>-0.5 kg this week</Text>
        </View>

        <View style={styles.keypad}>
          {KEYS.map((row, i) => (
            <View key={i} style={styles.keyRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.key,
                    key === "backspace" && styles.backspaceKey,
                  ]}
                  onPress={() => handleKeyPress(key)}
                >
                  {key === "backspace" ? (
                    <Ionicons name="backspace-outline" size={24} color={C.text} />
                  ) : (
                    <Text style={styles.keyText}>{key}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirmar</Text>
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
    padding: 20,
    justifyContent: "space-between",
  },
  weightSection: {
    alignItems: "center",
    marginTop: 20,
  },
  weightDisplay: {
    fontSize: 64,
    fontFamily: FONT.bold,
    color: C.text,
  },
  unitToggle: {
    flexDirection: "row",
    marginTop: 12,
    backgroundColor: C.card,
    borderRadius: 8,
    overflow: "hidden",
  },
  unitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  unitBtnActive: {
    backgroundColor: C.primary,
  },
  unitText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: C.gray,
  },
  unitTextActive: {
    color: C.white,
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginVertical: 12,
  },
  changeText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: "#4CAF50",
  },
  keypad: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  key: {
    width: 80,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
  },
  backspaceKey: {
    backgroundColor: C.card,
  },
  keyText: {
    fontSize: 24,
    fontFamily: FONT.medium,
    color: C.text,
  },
  confirmButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: C.white,
  },
});
