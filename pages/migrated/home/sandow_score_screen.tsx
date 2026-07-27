import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";

const SCORE_BREAKDOWN = [
  { label: "Endurance", score: 82, color: "#4CAF50" },
  { label: "Stamina", score: 78, color: "#FF9800" },
  { label: "Strength", score: 85, color: "#2196F3" },
  { label: "Flexibility", score: 75, color: "#9C27B0" },
  { label: "Body Composition", score: 90, color: "#00BCD4" },
  { label: "Recovery", score: 80, color: "#FF5722" },
];

const RANGE_CARDS = [
  { range: "0-40", label: "Poor", color: "#F44336" },
  { range: "40-60", label: "Average", color: "#FF9800" },
  { range: "60-80", label: "Good", color: "#FFC107" },
  { range: "80-100", label: "Excellent", color: "#4CAF50" },
];

const WEEKLY_DATA = [65, 72, 78, 80, 85, 88, 88];

export default function SandowScoreScreen() {


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>88</Text>
            <Text style={styles.scoreLabel}>Sandow Score</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Ranges</Text>
          <View style={styles.rangeRow}>
            {RANGE_CARDS.map((card) => (
              <View key={card.range} style={styles.rangeCard}>
                <View style={[styles.rangeDot, { backgroundColor: card.color }]} />
                <Text style={styles.rangeText}>{card.range}</Text>
                <Text style={styles.rangeLabel}>{card.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          {SCORE_BREAKDOWN.map((item) => (
            <View key={item.label} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownScore}>{item.score}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.score}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Trend</Text>
          <View style={styles.barChart}>
            {WEEKLY_DATA.map((value, index) => (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${value}%`,
                        backgroundColor:
                          index === WEEKLY_DATA.length - 1
                            ? C.primary
                            : C.gray + "40",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barDay}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          <View style={styles.recommendationCard}>
            <Ionicons name="bulb-outline" size={20} color="#FFC107" />
            <Text style={styles.recommendationText}>
              Tu puntuaciÃ³n ha mejorado un 5% esta semana. MantÃ©n tu rutina de
              ejercicios y aumenta la intensidad del entrenamiento de fuerza.
            </Text>
          </View>
          <View style={styles.recommendationCard}>
            <Ionicons name="fitness-outline" size={20} color={C.primary} />
            <Text style={styles.recommendationText}>
              Considera agregar mÃ¡s ejercicios de flexibilidad para mejorar tu
              puntuaciÃ³n en esa categorÃ­a.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    backgroundColor: "#1A1A2E",
    paddingVertical: 40,
    alignItems: "center",
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 48,
    fontFamily: FONT.bold,
    color: C.white,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: "#AAA",
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: C.text,
    marginBottom: 16,
  },
  rangeRow: {
    flexDirection: "row",
    gap: 8,
  },
  rangeCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  rangeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  rangeText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    color: C.text,
  },
  rangeLabel: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: C.gray,
    marginTop: 2,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: C.text,
  },
  breakdownScore: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: C.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: C.card,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  barChart: {
    flexDirection: "row",
    height: 150,
    alignItems: "flex-end",
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  barDay: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: C.gray,
    marginTop: 6,
  },
  recommendationCard: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    alignItems: "flex-start",
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.medium,
    color: C.text,
    lineHeight: 20,
  },
});
