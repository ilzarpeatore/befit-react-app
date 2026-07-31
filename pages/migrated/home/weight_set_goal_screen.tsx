import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, PanResponder, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const MIN_WEIGHT = 30;
const MAX_WEIGHT = 200;
const RULER_WIDTH = 300;

export default function WeightGoalSetScreen({ navigation }: any) {
  const styles = useStyle();
  const [targetWeight, setTargetWeight] = useState(65.0);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const rulerOffset = useRef(new Animated.Value(0)).current;

  const displayWeight = unit === "lbs" ? (targetWeight * 2.20462).toFixed(1) : targetWeight.toFixed(1);

  const rulerMarks: number[] = [];
  for (let w = MIN_WEIGHT; w <= MAX_WEIGHT; w += 1) {
    rulerMarks.push(w);
  }

  const handleRulerPress = (index: number) => {
    setTargetWeight(MIN_WEIGHT + index);
  };

  const currentIndex = targetWeight - MIN_WEIGHT;

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Establecer meta</Text>

          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === "kg" && styles.unitBtnActive]}
              onPress={() => setUnit("kg")}
            >
              <Text style={[styles.unitBtnText, unit === "kg" && styles.unitBtnTextActive]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === "lbs" && styles.unitBtnActive]}
              onPress={() => setUnit("lbs")}
            >
              <Text style={[styles.unitBtnText, unit === "lbs" && styles.unitBtnTextActive]}>lbs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weightDisplay}>
            <Text style={styles.weightValue}>{displayWeight}</Text>
            <Text style={styles.weightUnit}>{unit}</Text>
          </View>

          <Text style={styles.rulerLabel}>Desliza para ajustar</Text>
          <View style={styles.rulerContainer}>
            <View style={styles.rulerArrow}>
              <Ionicons name="caret-down" size={16} color={C.textPrimary} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rulerScroll}
            >
              {rulerMarks.map((w, i) => {
                const isMajor = w % 5 === 0;
                const isSelected = w === targetWeight;
                return (
                  <TouchableOpacity
                    key={w}
                    style={[styles.rulerMark, isSelected && styles.rulerMarkSelected]}
                    onPress={() => handleRulerPress(i)}
                  >
                    <View style={[styles.rulerLine, isMajor && styles.rulerLineMajor, isSelected && styles.rulerLineSelected]} />
                    {isMajor && (
                      <Text style={[styles.rulerNumber, isSelected && styles.rulerNumberSelected]}>{w}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.applyBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.applyBtnText}>Aplicar</Text>
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
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, marginBottom: 24 },
    unitToggle: { flexDirection: "row", backgroundColor: C.surface, borderRadius: 12, padding: 4, marginBottom: 28, borderWidth: 1, borderColor: C.border, alignSelf: "center" },
    unitBtn: { paddingVertical: 10, paddingHorizontal: 28, borderRadius: 10 },
    unitBtnActive: { backgroundColor: C.brand50 },
    unitBtnText: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray50 },
    unitBtnTextActive: { color: C.white },
    weightDisplay: { alignItems: "center", marginBottom: 32 },
    weightValue: { fontSize: 56, fontFamily: FONT.extraBold, color: C.white },
    weightUnit: { fontSize: 18, fontFamily: FONT.medium, color: C.gray50, marginTop: 4 },
    rulerLabel: { fontSize: 13, fontFamily: FONT.regular, color: C.gray50, textAlign: "center", marginBottom: 8 },
    rulerContainer: { marginBottom: 40, alignItems: "center" },
    rulerArrow: { marginBottom: 4, zIndex: 1 },
    rulerScroll: { paddingVertical: 8, paddingHorizontal: 140 },
    rulerMark: { width: 20, alignItems: "center", marginRight: 0 },
    rulerMarkSelected: { backgroundColor: "transparent" },
    rulerLine: { width: 2, height: 20, backgroundColor: C.gray30, borderRadius: 1 },
    rulerLineMajor: { height: 30, backgroundColor: C.gray10 },
    rulerLineSelected: { height: 40, backgroundColor: C.brand50, width: 3 },
    rulerNumber: { fontSize: 11, fontFamily: FONT.medium, color: C.gray50, marginTop: 6 },
    rulerNumberSelected: { color: C.textPrimary, fontFamily: FONT.bold },
    applyBtn: { backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
    applyBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  });
}
