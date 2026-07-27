import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";

const SCORE = 65;
const BREAKDOWN = [
  { label: "Resistencia", value: 72, color: "#4CAF50" },
  { label: "Fuerza", value: 58, color: "#FF9800" },
  { label: "RecuperaciÃ³n", value: 65, color: "#2196F3" },
  { label: "Equilibrio", value: 68, color: "#9C27B0" },
];

const BODY_COMP = [
  { label: "MÃºsculo", value: 42, color: C.primary },
  { label: "Grasa", value: 24, color: "#FF5722" },
  { label: "Agua", value: 55, color: "#03A9F4" },
  { label: "Ã“seo", value: 15, color: "#795548" },
];

export default function AssessmentResultScreen({ navigation }: any) {
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (SCORE / 100) * circumference;

  return (
    <SafeAreaView style={localStyles.container}>
      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <Text style={[localStyles.title, { color: C.primary }]}>Resultado del assessment</Text>

        <View style={localStyles.scoreContainer}>
          <View style={[localStyles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
            <View style={[localStyles.scoreRing, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: C.primary + "30" }]}>
              <View style={[localStyles.scoreOverlay, { width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: (size - strokeWidth * 2) / 2, borderColor: C.primary, borderWidth: strokeWidth, borderTopColor: C.primary + "30", borderRightColor: C.primary + "30" }]} />
            </View>
            <View style={localStyles.scoreTextContainer}>
              <Text style={[localStyles.scoreValue, { color: C.primary }]}>{SCORE}</Text>
              <Text style={[localStyles.scoreUnit, { color: C.gray }]}>pts</Text>
            </View>
          </View>
          <Text style={[localStyles.scoreLabel, { color: C.gray }]}>de 100</Text>
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Desglose de puntuaciÃ³n</Text>
          {BREAKDOWN.map((item) => (
            <View key={item.label} style={localStyles.barRow}>
              <Text style={[localStyles.barLabel, { color: C.white }]}>{item.label}</Text>
              <View style={localStyles.barTrack}>
                <View style={[localStyles.barFill, { width: `${item.value}%`, backgroundColor: item.color }]} />
              </View>
              <Text style={[localStyles.barValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>ComposiciÃ³n corporal</Text>
          {BODY_COMP.map((item) => (
            <View key={item.label} style={localStyles.barRow}>
              <Text style={[localStyles.barLabel, { color: C.white }]}>{item.label}</Text>
              <View style={localStyles.barTrack}>
                <View style={[localStyles.barFill, { width: `${item.value}%`, backgroundColor: item.color }]} />
              </View>
              <Text style={[localStyles.barValue, { color: item.color }]}>{item.value}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={localStyles.bottomBar}>
        <TouchableOpacity
          style={[localStyles.continueBtn, { backgroundColor: C.primary }]}
          onPress={() => navigation.navigate("MigratedRecommendations")}
        >
          <Text style={localStyles.continueBtnText}>Ver recomendaciones</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontFamily: FONT.bold, marginBottom: 24, textAlign: "center" },
  scoreContainer: { alignItems: "center", marginBottom: 30 },
  circle: { justifyContent: "center", alignItems: "center" },
  scoreRing: { justifyContent: "center", alignItems: "center", position: "absolute" },
  scoreOverlay: { justifyContent: "center", alignItems: "center" },
  scoreTextContainer: { alignItems: "center" },
  scoreValue: { fontSize: 42, fontFamily: FONT.bold },
  scoreUnit: { fontSize: 14 },
  scoreLabel: { fontSize: 13, marginTop: 4 },
  section: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontFamily: FONT.bold, marginBottom: 14, color: C.white },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  barLabel: { width: 90, fontSize: 13 },
  barTrack: { flex: 1, height: 10, backgroundColor: C.gray40, borderRadius: 5, marginHorizontal: 10, overflow: "hidden" },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { width: 30, fontSize: 13, fontFamily: FONT.bold, textAlign: "right" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, backgroundColor: C.surface },
  continueBtn: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  continueBtnText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
});
