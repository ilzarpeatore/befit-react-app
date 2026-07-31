import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS_LABELS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

export default function WeightDeadlineScreen({ navigation }: any) {
  const styles = useStyle();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [reminderHour, setReminderHour] = useState("08:00");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const renderDays = () => {
    const days: React.ReactNode[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected = selectedDate === d;
      const isPast = new Date(currentYear, currentMonth, d) < new Date(new Date().toDateString());
      days.push(
        <TouchableOpacity
          key={d}
          style={[styles.dayCell, isSelected && styles.dayCellSelected, isPast && styles.dayCellPast]}
          onPress={() => !isPast && setSelectedDate(d)}
          disabled={isPast}
        >
          <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isPast && styles.dayTextPast]}>
            {d}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  const hours = ["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Establecer fecha l\u00EDmite</Text>
          <Text style={styles.subtitle}>Selecciona una fecha para alcanzar tu meta de peso.</Text>

          <View style={styles.calendarCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => setCurrentMonth(m => m - 1)}>
                <Ionicons name="chevron-back" size={22} color={C.white} />
              </TouchableOpacity>
              <Text style={styles.calMonth}>{MONTHS[currentMonth]} {currentYear}</Text>
              <TouchableOpacity onPress={() => setCurrentMonth(m => m + 1)}>
                <Ionicons name="chevron-forward" size={22} color={C.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.daysRow}>
              {DAYS_LABELS.map(d => (
                <View key={d} style={styles.dayLabel}>
                  <Text style={styles.dayLabelText}>{d}</Text>
                </View>
              ))}
            </View>
            <View style={styles.daysGrid}>{renderDays()}</View>
          </View>

          {selectedDate && (
            <View style={styles.deadlineDisplay}>
              <Ionicons name="calendar" size={20} color={C.textPrimary} />
              <Text style={styles.deadlineText}>
                Fecha l\u00EDmite: {selectedDate} de {MONTHS[currentMonth]} {currentYear}
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Hora de recordatorio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hoursScroll}>
            {hours.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.hourChip, reminderHour === h && styles.hourChipActive]}
                onPress={() => setReminderHour(h)}
              >
                <Text style={[styles.hourText, reminderHour === h && styles.hourTextActive]}>{h}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate("MigratedWeightSetGoal")}>
            <Text style={styles.continueBtnText}>Continuar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate("MigratedWeightSetGoal")}>
            <Text style={styles.skipBtnText}>Omitir</Text>
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
    backBtn: { marginBottom: 16, width: 40, height: 40, justifyContent: "center" },
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, marginBottom: 8 },
    subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50, marginBottom: 24 },
    calendarCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border },
    calHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    calMonth: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
    daysRow: { flexDirection: "row", marginBottom: 8 },
    dayLabel: { flex: 1, alignItems: "center" },
    dayLabelText: { fontSize: 12, fontFamily: FONT.medium, color: C.gray50 },
    daysGrid: { flexDirection: "row", flexWrap: "wrap" },
    dayCell: { width: "14.28%", height: 42, justifyContent: "center", alignItems: "center" },
    dayCellSelected: { backgroundColor: C.brand50, borderRadius: 21 },
    dayCellPast: { opacity: 0.3 },
    dayText: { fontSize: 14, fontFamily: FONT.medium, color: C.white },
    dayTextSelected: { color: C.white, fontFamily: FONT.bold },
    dayTextPast: { color: C.gray50 },
    deadlineDisplay: { flexDirection: "row", alignItems: "center", backgroundColor: C.brand5, borderRadius: 12, padding: 14, marginBottom: 24, gap: 10 },
    deadlineText: { fontSize: 14, fontFamily: FONT.semiBold, color: C.textPrimary },
    sectionTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white, marginBottom: 12 },
    hoursScroll: { marginBottom: 32 },
    hourChip: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, marginRight: 10 },
    hourChipActive: { backgroundColor: C.brand50, borderColor: C.brand50 },
    hourText: { fontSize: 14, fontFamily: FONT.medium, color: C.gray50 },
    hourTextActive: { color: C.white },
    continueBtn: { backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
    continueBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
    skipBtn: { paddingVertical: 12, alignItems: "center" },
    skipBtnText: { fontSize: 14, fontFamily: FONT.medium, color: C.gray50 },
  });
}
