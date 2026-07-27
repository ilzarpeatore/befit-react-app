import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const METRICS = [
  { id: "heart_rate", name: "Heart Rate", value: "72", unit: "bpm", status: "Normal", statusColor: C.success50, icon: "heart", iconBg: C.destructive5, iconColor: C.destructive50, chart: [65, 68, 72, 70, 74, 72] },
  { id: "steps", name: "Steps", value: "1,258", unit: "left", status: "1,225 left", statusColor: C.warning40, icon: "footsteps", iconBg: C.brand5, iconColor: C.brand50, chart: [200, 450, 680, 890, 1050, 1258] },
  { id: "weight", name: "Weight", value: "70", unit: "kg", status: "Stable", statusColor: C.success50, icon: "scale-outline", iconBg: C.blue5, iconColor: C.blue50, chart: [71, 70.5, 70.2, 70, 70, 70] },
  { id: "hydration", name: "Hydration", value: "2.1", unit: "L", status: "Good", statusColor: C.success50, icon: "water", iconBg: C.blue5, iconColor: C.blue50, chart: [0.5, 1.0, 1.4, 1.7, 1.9, 2.1] },
  { id: "blood_pressure", name: "Blood Pressure", value: "128/80", unit: "mmHg", status: "Normal", statusColor: C.success50, icon: "pulse", iconBg: C.destructive5, iconColor: C.destructive50, chart: [130, 128, 126, 128, 127, 128] },
  { id: "sleep", name: "Sleep", value: "7h 30m", unit: "", status: "Good", statusColor: C.success50, icon: "moon", iconBg: C.purple5, iconColor: C.purple50, chart: [6.5, 7.0, 7.5, 7.2, 7.8, 7.5] },
  { id: "nutrition", name: "Nutrition", value: "1,850", unit: "kcal", status: "On Track", statusColor: C.brand50, icon: "restaurant", iconBg: C.brand5, iconColor: C.brand50, chart: [1600, 1750, 1800, 1850, 1820, 1850] },
  { id: "mood", name: "Mood", value: "Good", unit: "", status: "Stable", statusColor: C.success50, icon: "happy", iconBg: C.warning5, iconColor: C.warning40, chart: [3, 3, 4, 4, 4, 4] },
];

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <View style={miniStyles.row}>
      {data.map((val, i) => {
        const height = ((val - min) / range) * 24 + 4;
        return (
          <View
            key={i}
            style={[
              miniStyles.bar,
              {
                height,
                backgroundColor: color,
                opacity: 0.3 + (i / data.length) * 0.7,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  bar: { width: 4, borderRadius: 2 },
});

export default function FitnessMetricsScreen({ navigation }: any) {
  const styles = useStyle();

  const handlePress = (metric: (typeof METRICS)[number]) => {
    navigation.navigate("MigratedHealthMetricInsight", { metricType: metric.id });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fitness Metrics</Text>
        </View>
        <ScrollView contentContainerStyle={styles.list}>
          {METRICS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handlePress(m)}
            >
              <View style={[styles.iconCircle, { backgroundColor: m.iconBg }]}>
                <Ionicons name={m.icon as any} size={22} color={m.iconColor} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{m.name}</Text>
                <View style={styles.cardValueRow}>
                  <Text style={styles.cardValue}>{m.value}</Text>
                  {m.unit ? <Text style={styles.cardUnit}>{m.unit}</Text> : null}
                  <View style={[styles.badge, { backgroundColor: m.statusColor + "20" }]}>
                    <Text style={[styles.badgeText, { color: m.statusColor }]}>{m.status}</Text>
                  </View>
                </View>
              </View>
              <MiniChart data={m.chart} color={m.iconColor} />
              <Ionicons name="chevron-forward" size={16} color={C.gray10} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    headerTitle: { fontSize: 28, fontFamily: FONT.bold, color: C.white },
    list: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
      gap: 12,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    cardBody: { flex: 1 },
    cardName: { fontSize: 14, fontFamily: FONT.medium, color: C.gray5 },
    cardValueRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    cardValue: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
    cardUnit: { fontSize: 13, fontFamily: FONT.regular, color: C.gray5, marginRight: 8 },
    badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
    badgeText: { fontSize: 11, fontFamily: FONT.semiBold },
  });
}
