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

interface Metric {
  id: string;
  name: string;
  icon: string;
}

const INITIAL_METRICS: Metric[] = [
  { id: "1", name: "Weight", icon: "scale-outline" },
  { id: "2", name: "Blood Pressure", icon: "heart-outline" },
  { id: "3", name: "Heart Rate", icon: "pulse-outline" },
  { id: "4", name: "Steps", icon: "footsteps-outline" },
  { id: "5", name: "Sleep", icon: "moon-outline" },
  { id: "6", name: "Hydration", icon: "water-outline" },
  { id: "7", name: "Nutrition", icon: "nutrition-outline" },
  { id: "8", name: "Mood", icon: "happy-outline" },
];

export default function ManageHealthMetricsScreen({ navigation }: any) {

  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar", "Â¿Eliminar esta mÃ©trica?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => setMetrics((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  const handleSave = () => {
    Alert.alert("Ã‰xito", "MÃ©tricas guardadas correctamente");
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...metrics];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setMetrics(updated);
  };

  const moveDown = (index: number) => {
    if (index === metrics.length - 1) return;
    const updated = [...metrics];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setMetrics(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Gestionar mÃ©tricas</Text>

        {metrics.map((metric, index) => (
          <View key={metric.id} style={styles.metricItem}>
            <View style={styles.metricLeft}>
              <Ionicons name="reorder-three-outline" size={20} color={C.gray} />
              <Ionicons
                name={metric.icon as any}
                size={20}
                color={C.primary}
                style={{ marginHorizontal: 12 }}
              />
              <Text style={styles.metricName}>{metric.name}</Text>
            </View>
            <View style={styles.metricRight}>
              <TouchableOpacity onPress={() => moveUp(index)}>
                <Ionicons name="chevron-up" size={18} color={C.gray} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => moveDown(index)}>
                <Ionicons name="chevron-down" size={18} color={C.gray} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(metric.id)}>
                <Ionicons name="trash-outline" size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

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
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  metricLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metricName: {
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
