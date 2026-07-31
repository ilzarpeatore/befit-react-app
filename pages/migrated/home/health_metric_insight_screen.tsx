import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const METRIC_DATA: Record<string, any> = {
  heart_rate: {
    label: "Heart Rate",
    icon: "heart",
    iconColor: C.destructive50,
    peak: "145 bpm",
    average: "72 bpm",
    min: "58 bpm",
    max: "145 bpm",
    score: 85,
    trend: [65, 70, 72, 68, 75, 72, 70],
    recommendations: [
      "Maintain consistent cardio sessions 3x/week",
      "Monitor resting heart rate for changes",
      "Consider HRV training for recovery",
    ],
  },
  steps: {
    label: "Steps",
    icon: "footsteps",
    iconColor: C.brand50,
    peak: "12,450",
    average: "8,200",
    min: "3,100",
    max: "12,450",
    score: 72,
    trend: [6500, 8200, 9800, 7400, 10200, 8200, 7800],
    recommendations: [
      "Aim for 10,000 steps daily",
      "Take walking breaks every hour",
      "Use stairs instead of elevator",
    ],
  },
  weight: {
    label: "Weight",
    icon: "scale-outline",
    iconColor: C.blue50,
    peak: "72 kg",
    average: "70.5 kg",
    min: "69.8 kg",
    max: "72 kg",
    score: 90,
    trend: [71, 70.8, 70.5, 70.3, 70.1, 70, 70],
    recommendations: [
      "Weight is stable - keep it up",
      "Continue tracking weekly",
      "Maintain balanced nutrition",
    ],
  },
  hydration: {
    label: "Hydration",
    icon: "water",
    iconColor: C.blue50,
    peak: "2.8L",
    average: "2.1L",
    min: "1.5L",
    max: "2.8L",
    score: 78,
    trend: [1.5, 1.8, 2.1, 1.9, 2.3, 2.1, 2.0],
    recommendations: [
      "Increase water intake to 2.5L daily",
      "Drink water before each meal",
      "Carry a water bottle throughout the day",
    ],
  },
  sleep: {
    label: "Sleep",
    icon: "moon",
    iconColor: C.purple50,
    peak: "8h 45m",
    average: "7h 20m",
    min: "5h 30m",
    max: "8h 45m",
    score: 82,
    trend: [6.5, 7.2, 7.5, 7.0, 7.8, 7.3, 7.5],
    recommendations: [
      "Maintain consistent sleep schedule",
      "Avoid screens 1hr before bed",
      "Keep bedroom cool and dark",
    ],
  },
  nutrition: {
    label: "Nutrition",
    icon: "restaurant",
    iconColor: C.brand50,
    peak: "2,200 kcal",
    average: "1,850 kcal",
    min: "1,400 kcal",
    max: "2,200 kcal",
    score: 88,
    trend: [1600, 1750, 1850, 1800, 1900, 1850, 1820],
    recommendations: [
      "Protein intake is on track",
      "Increase vegetable portions",
      "Monitor micronutrient intake",
    ],
  },
};

function CircularProgress({ score }: { score: number }) {
  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={[cpStyles.wrapper, { width: size, height: size }]}>
      <View
        style={[
          cpStyles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: C.gray30,
          },
        ]}
      />
      <View
        style={[
          cpStyles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: C.brand50,
            borderLeftColor: C.gray30,
            borderBottomColor: C.gray30,
          },
        ]}
      />
      <View style={cpStyles.label}>
        <Text style={cpStyles.score}>{score}</Text>
        <Text style={cpStyles.of}>/100</Text>
      </View>
    </View>
  );
}

const cpStyles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  circle: { position: "absolute" },
  label: { alignItems: "center" },
  score: { fontSize: 32, fontFamily: FONT.bold, color: C.white },
  of: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50 },
});

export default function HealthMetricInsightScreen({ route }: any) {
  const styles = useStyle();
  const metricType = route?.params?.metricType || "heart_rate";
  const data = METRIC_DATA[metricType] || METRIC_DATA.heart_rate;

  const maxTrend = Math.max(...data.trend);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.darkHeader}>
          <Ionicons name={data.icon} size={28} color={data.iconColor} />
          <Text style={styles.headerTitle}>{data.label} Insight</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.overviewRow}>
            {[
              { label: "Peak", value: data.peak },
              { label: "Average", value: data.average },
              { label: "Min", value: data.min },
              { label: "Max", value: data.max },
            ].map((item) => (
              <View key={item.label} style={styles.overviewCard}>
                <Text style={styles.overviewLabel}>{item.label}</Text>
                <Text style={styles.overviewValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.scoreSection}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <CircularProgress score={data.score} />
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Daily Trend</Text>
            <View style={styles.chartRow}>
              {DAYS.map((day, i) => (
                <View key={day} style={styles.chartCol}>
                  <View style={styles.chartBarWrapper}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: (data.trend[i] / maxTrend) * 100,
                          backgroundColor: data.iconColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartDay}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.recSection}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {data.recommendations.map((rec: string, i: number) => (
              <View key={i} style={styles.recItem}>
                <Ionicons name="checkmark-circle" size={20} color={C.success50} />
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    darkHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: C.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    headerTitle: { fontSize: 22, fontFamily: FONT.bold, color: C.white },
    content: { padding: 20, paddingBottom: 40 },
    overviewRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
    overviewCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: C.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: C.border,
    },
    overviewLabel: { fontSize: 12, fontFamily: FONT.regular, color: C.gray50, marginBottom: 4 },
    overviewValue: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
    scoreSection: { alignItems: "center", marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontFamily: FONT.semiBold, color: C.white, marginBottom: 16 },
    chartSection: { marginBottom: 28 },
    chartRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 120 },
    chartCol: { alignItems: "center", flex: 1 },
    chartBarWrapper: { height: 100, justifyContent: "flex-end" },
    chartBar: { width: 20, borderRadius: 6 },
    chartDay: { fontSize: 11, fontFamily: FONT.regular, color: C.gray50, marginTop: 6 },
    recSection: { marginBottom: 32 },
    recItem: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    recText: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50, flex: 1 },
  });
}
