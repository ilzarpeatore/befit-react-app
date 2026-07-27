import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const FILTERS = ["All", "High", "Normal", "Low"];

interface Entry {
  time: string;
  bpm: number;
  status: "normal" | "high" | "low";
}

const HISTORY: Record<string, Entry[]> = {
  Today: [
    { time: "10:32 AM", bpm: 72, status: "normal" },
    { time: "09:15 AM", bpm: 68, status: "normal" },
    { time: "07:45 AM", bpm: 62, status: "normal" },
  ],
  Yesterday: [
    { time: "08:20 PM", bpm: 85, status: "high" },
    { time: "06:10 PM", bpm: 72, status: "normal" },
    { time: "02:30 PM", bpm: 78, status: "normal" },
    { time: "09:00 AM", bpm: 58, status: "low" },
  ],
  "Jun 23": [
    { time: "07:55 PM", bpm: 145, status: "high" },
    { time: "03:00 PM", bpm: 72, status: "normal" },
    { time: "10:15 AM", bpm: 65, status: "normal" },
  ],
};

function statusColor(status: string) {
  if (status === "high") return C.warning40;
  if (status === "low") return C.blue50;
  return C.success50;
}

export default function HeartRateHistoryScreen({ navigation }: any) {
  const styles = useStyle();
  const [filter, setFilter] = useState("All");

  const filteredHistory = Object.fromEntries(
    Object.entries(HISTORY).map(([date, entries]) => [
      date,
      entries.filter((e) => filter === "All" || e.status === filter.toLowerCase()),
    ])
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Heart Rate History</Text>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {Object.entries(filteredHistory).map(([date, entries]) =>
            entries.length > 0 ? (
              <View key={date} style={styles.group}>
                <Text style={styles.dateLabel}>{date}</Text>
                {entries.map((entry, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.entry}
                    onPress={() => navigation.navigate("MigratedHeartRateDetails")}
                  >
                    <View style={styles.entryLeft}>
                      <View style={[styles.dot, { backgroundColor: statusColor(entry.status) }]} />
                      <Text style={styles.entryTime}>{entry.time}</Text>
                    </View>
                    <Text style={styles.entryBpm}>{entry.bpm} bpm</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: { fontSize: 22, fontFamily: FONT.bold, color: C.white },
    filterRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 16,
    },
    filterBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
    },
    filterBtnActive: { backgroundColor: C.brand50, borderColor: C.brand50 },
    filterText: { fontSize: 13, fontFamily: FONT.medium, color: C.gray5 },
    filterTextActive: { color: C.white },
    list: { paddingHorizontal: 20, paddingBottom: 32 },
    group: { marginBottom: 24 },
    dateLabel: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray5, marginBottom: 10 },
    entry: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 8,
    },
    entryLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    entryTime: { fontSize: 14, fontFamily: FONT.regular, color: C.gray5 },
    entryBpm: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  });
}
