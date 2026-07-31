import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";

export default function LogStepsFormScreen({ navigation }: any) {

  const [stepCount, setStepCount] = useState(0);
  const [distance, setDistance] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSave = () => {
    if (stepCount === 0) {
      Alert.alert("Error", "Ingresa la cantidad de pasos");
      return;
    }
    Alert.alert("Ã‰xito", "Pasos registrados correctamente", [
      { text: "OK", onPress: () => navigation.navigate("MigratedStepsLogged") },
    ]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Registrar pasos</Text>

        <View style={styles.datePickerRow}>
          <Ionicons name="calendar-outline" size={20} color={C.textPrimary} />
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity
            onPress={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d);
            }}
          >
            <Ionicons name="chevron-back" size={20} color={C.gray} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d);
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={C.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.stepCounter}>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => setStepCount(Math.max(0, stepCount - 100))}
          >
            <Ionicons name="remove" size={24} color={C.white} />
          </TouchableOpacity>
          <View style={styles.stepDisplay}>
            <Text style={styles.stepCount}>{stepCount.toLocaleString()}</Text>
            <Text style={styles.stepLabel}>pasos</Text>
          </View>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => setStepCount(stepCount + 100)}
          >
            <Ionicons name="add" size={24} color={C.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Distancia (km)</Text>
          <View style={styles.inputRow}>
            <Ionicons name="navigate-outline" size={18} color={C.gray} />
            <Text style={styles.inputText}>
              {distance || "0.0"}
            </Text>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Hora</Text>
          <View style={styles.inputRow}>
            <Ionicons name="time-outline" size={18} color={C.gray} />
            <Text style={styles.inputText}>
              {new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: C.text,
    marginBottom: 24,
  },
  datePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.medium,
    color: C.text,
  },
  stepCounter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    gap: 24,
  },
  stepButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDisplay: {
    alignItems: "center",
  },
  stepCount: {
    fontSize: 48,
    fontFamily: FONT.bold,
    color: C.text,
  },
  stepLabel: {
    fontSize: 14,
    color: C.gray,
    fontFamily: FONT.medium,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: C.gray,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  inputText: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: C.text,
  },
  saveButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: C.white,
  },
});
