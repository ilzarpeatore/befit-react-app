import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

export default function WeightGoalSummaryScreen({ navigation }: any) {
  const styles = useStyle();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: 0.7, duration: 1000, useNativeDriver: false }).start();
  }, []);

  const currentWeight = 70.0;
  const goalWeight = 65.0;
  const totalDiff = 5.0;
  const progress = (totalDiff - (currentWeight - goalWeight)) / totalDiff;

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Resumen de meta</Text>

          <View style={styles.weightsRow}>
            <View style={styles.weightCard}>
              <Text style={styles.weightLabel}>Actual</Text>
              <Text style={styles.weightValue}>{currentWeight.toFixed(1)} kg</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={C.textPrimary} />
            <View style={[styles.weightCard, styles.weightCardGoal]}>
              <Text style={styles.weightLabel}>Meta</Text>
              <Text style={[styles.weightValue, { color: C.success50 }]}>{goalWeight.toFixed(1)} kg</Text>
            </View>
          </View>

          <View style={styles.ringContainer}>
            <View style={styles.ringOuter}>
              <View style={styles.ringTrack} />
              <View style={[styles.ringFill, { height: `${Math.min(progress * 100, 100)}%` as any }]} />
              <View style={styles.ringCenter}>
                <Text style={styles.ringPercent}>{Math.round(progress * 100)}%</Text>
                <Text style={styles.ringLabel}>completado</Text>
              </View>
            </View>
            <Text style={styles.distanceText}>Te faltan {(currentWeight - goalWeight).toFixed(1)} kg</Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("MigratedWeightSetGoal")}>
            <Ionicons name="pencil" size={18} color={C.textPrimary} />
            <Text style={styles.editBtnText}>Editar meta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deadlineBtn} onPress={() => navigation.navigate("MigratedWeightDeadline")}>
            <Ionicons name="calendar-outline" size={18} color={C.white} />
            <Text style={styles.deadlineBtnText}>Establecer fecha l\u00EDmite</Text>
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
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, marginBottom: 28 },
    weightsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 32 },
    weightCard: { backgroundColor: C.surface, borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1, borderColor: C.border, minWidth: 120 },
    weightCardGoal: { borderColor: C.success50 },
    weightLabel: { fontSize: 12, fontFamily: FONT.medium, color: C.gray50, marginBottom: 4 },
    weightValue: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
    ringContainer: { alignItems: "center", marginBottom: 36 },
    ringOuter: { width: 160, height: 160, borderRadius: 80, backgroundColor: C.gray30, justifyContent: "center", alignItems: "center", overflow: "hidden" },
    ringTrack: { ...StyleSheet.absoluteFill, borderRadius: 80 },
    ringFill: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.brand50, borderRadius: 80 },
    ringCenter: { zIndex: 1, alignItems: "center" },
    ringPercent: { fontSize: 28, fontFamily: FONT.bold, color: C.white },
    ringLabel: { fontSize: 11, fontFamily: FONT.medium, color: C.gray50 },
    distanceText: { fontSize: 14, fontFamily: FONT.medium, color: C.gray50, marginTop: 12 },
    editBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.brand5, borderRadius: 14, paddingVertical: 14, marginBottom: 12, borderWidth: 1, borderColor: C.brand50, gap: 8 },
    editBtnText: { fontSize: 15, fontFamily: FONT.semiBold, color: C.textPrimary },
    deadlineBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.brand50, borderRadius: 14, paddingVertical: 14, gap: 8 },
    deadlineBtnText: { fontSize: 15, fontFamily: FONT.semiBold, color: C.white },
  });
}
