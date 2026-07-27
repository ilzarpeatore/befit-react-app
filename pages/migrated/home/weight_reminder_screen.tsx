import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const DAYS = [
  { key: "L", label: "L" },
  { key: "M", label: "M" },
  { key: "X", label: "X" },
  { key: "J", label: "J" },
  { key: "V", label: "V" },
  { key: "S", label: "S" },
  { key: "D", label: "D" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 === 0 ? 12 : i % 12;
  const suffix = i < 12 ? "AM" : "PM";
  return `${h}:00 ${suffix}`;
});

export default function WeightReminderScreen({ navigation }: any) {
  const styles = useStyle();
  const [selectedDays, setSelectedDays] = useState<string[]>(["L", "M", "X", "J", "V"]);
  const [selectedHour, setSelectedHour] = useState("8:00 AM");

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Recordatorio de peso</Text>
          <Text style={styles.subtitle}>Configura d\u00EDas y hora para registrar tu peso.</Text>

          <Text style={styles.sectionTitle}>D\u00EDas de la semana</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d) => {
              const active = selectedDays.includes(d.key);
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dayCircle, active && styles.dayCircleActive]}
                  onPress={() => toggleDay(d.key)}
                >
                  <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{d.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Hora del recordatorio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hoursScroll}>
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.hourChip, selectedHour === h && styles.hourChipActive]}
                onPress={() => setSelectedHour(h)}
              >
                <Text style={[styles.hourText, selectedHour === h && styles.hourTextActive]}>{h}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.navigate("MigratedWeightSetGoal")}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 24 },
    backBtn: { marginBottom: 8, width: 40, height: 40, justifyContent: "center" },
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, marginBottom: 8 },
    subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray5, marginBottom: 28 },
    sectionTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white, marginBottom: 12 },
    daysRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
    dayCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, borderWidth: 2, borderColor: C.border, justifyContent: "center", alignItems: "center" },
    dayCircleActive: { backgroundColor: C.brand50, borderColor: C.brand50 },
    dayLabel: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray5 },
    dayLabelActive: { color: C.white },
    hoursScroll: { marginBottom: 36 },
    hourChip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, marginRight: 10 },
    hourChipActive: { backgroundColor: C.brand50, borderColor: C.brand50 },
    hourText: { fontSize: 13, fontFamily: FONT.medium, color: C.gray5 },
    hourTextActive: { color: C.white },
    saveBtn: { backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
    saveBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  });
}
