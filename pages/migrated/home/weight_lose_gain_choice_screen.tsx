import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

export default function WeightLoseGainChoiceScreen({ navigation }: any) {
  const styles = useStyle();
  const [choice, setChoice] = useState<"lose" | "gain" | null>(null);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Ionicons name="scale" size={64} color={C.textPrimary} />
          </View>

          <Text style={styles.title}>{"\u00BFCu\u00E1l es tu objetivo?"}</Text>
          <Text style={styles.subtitle}>Selecciona tu objetivo principal de peso.</Text>

          <TouchableOpacity
            style={[styles.choiceCard, choice === "lose" && styles.choiceCardActiveLose]}
            onPress={() => setChoice("lose")}
          >
            <View style={[styles.choiceIcon, { backgroundColor: C.destructive5 }]}>
              <Ionicons name="arrow-down" size={28} color={C.destructive50} />
            </View>
            <View style={styles.choiceContent}>
              <Text style={styles.choiceTitle}>Perder peso</Text>
              <Text style={styles.choiceSubtitle}>Reducir tu peso corporal actual</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.gray50} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceCard, choice === "gain" && styles.choiceCardActiveGain]}
            onPress={() => setChoice("gain")}
          >
            <View style={[styles.choiceIcon, { backgroundColor: C.success5 }]}>
              <Ionicons name="arrow-up" size={28} color={C.success50} />
            </View>
            <View style={styles.choiceContent}>
              <Text style={styles.choiceTitle}>Ganar peso</Text>
              <Text style={styles.choiceSubtitle}>Aumentar tu masa corporal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.gray50} />
          </TouchableOpacity>

          {choice && (
            <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate("MigratedWeightGoalSummary")}>
              <Text style={styles.continueBtnText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={18} color={C.white} />
            </TouchableOpacity>
          )}
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
    iconWrap: { alignSelf: "center", width: 120, height: 120, borderRadius: 60, backgroundColor: C.brand5, justifyContent: "center", alignItems: "center", marginBottom: 28, borderWidth: 2, borderColor: C.brand50 },
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, textAlign: "center", marginBottom: 8 },
    subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50, textAlign: "center", marginBottom: 32 },
    choiceCard: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 2, borderColor: C.border, gap: 14 },
    choiceCardActiveLose: { borderColor: C.destructive50 },
    choiceCardActiveGain: { borderColor: C.success50 },
    choiceIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center" },
    choiceContent: { flex: 1 },
    choiceTitle: { fontSize: 17, fontFamily: FONT.semiBold, color: C.white, marginBottom: 2 },
    choiceSubtitle: { fontSize: 13, fontFamily: FONT.regular, color: C.gray50 },
    continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, marginTop: 20, gap: 8 },
    continueBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  });
}
