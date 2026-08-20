import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";
import { useAuth } from "@store/AuthContext";

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 25) return "Peso saludable";
  if (bmi < 30) return "Sobrepeso";
  return "Obesidad";
}

export default function AssessmentResultScreen({ navigation }: any) {
  const { state } = useAuth();
  const profile = state.user?.user_profile;
  const bmi = profile?.bmi ? parseFloat(profile.bmi) : null;
  const bmr = profile?.bmr ? parseFloat(profile.bmr) : null;
  const hasRealData = bmi !== null && !Number.isNaN(bmi);

  const size = 160;
  const strokeWidth = 12;

  return (
    <SafeAreaView style={localStyles.container}>
      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <Text style={[localStyles.title, { color: C.textPrimary }]}>Tu punto de partida</Text>

        {hasRealData ? (
          <>
            <View style={localStyles.scoreContainer}>
              <View style={[localStyles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
                <View style={[localStyles.scoreRing, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: C.primary + "30" }]}>
                  <View style={[localStyles.scoreOverlay, { width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: (size - strokeWidth * 2) / 2, borderColor: C.primary, borderWidth: strokeWidth, borderTopColor: C.primary + "30", borderRightColor: C.primary + "30" }]} />
                </View>
                <View style={localStyles.scoreTextContainer}>
                  <Text style={[localStyles.scoreValue, { color: C.textPrimary }]}>{bmi!.toFixed(1)}</Text>
                  <Text style={[localStyles.scoreUnit, { color: C.gray }]}>IMC</Text>
                </View>
              </View>
              <Text style={[localStyles.scoreLabel, { color: C.gray }]}>{bmiCategory(bmi!)}</Text>
            </View>

            {bmr !== null && !Number.isNaN(bmr) && (
              <View style={localStyles.section}>
                <Text style={localStyles.sectionTitle}>Tu metabolismo basal</Text>
                <Text style={[localStyles.barLabel, { color: C.white, width: "auto" }]}>
                  Quemas alrededor de {Math.round(bmr)} kcal en reposo cada día — esto se afinará con tu actividad real a medida que uses la app.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Aún no tenemos datos suficientes</Text>
            <Text style={[localStyles.barLabel, { color: C.white, width: "auto" }]}>
              Completa tu peso y altura en tu perfil para ver tu IMC y metabolismo basal reales aquí.
            </Text>
          </View>
        )}

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Composición corporal</Text>
          <Text style={[localStyles.barLabel, { color: C.white, width: "auto" }]}>
            Registra tus medidas en Antropometría para ver tu composición corporal real y su evolución a lo largo del tiempo.
          </Text>
        </View>
      </ScrollView>

      <View style={localStyles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            localStyles.continueBtn,
            { backgroundColor: C.primary },
            pressed && { opacity: 0.2 },
          ]}
          onPress={() => navigation.navigate("MigratedRecommendations")}
        >
          <Text style={localStyles.continueBtnText}>Ver recomendaciones</Text>
        </Pressable>
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
