import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "$9.99",
    period: "/mes",
    features: ["Rutinas bÃ¡sicas", "Seguimiento de progreso", "Soporte por email"],
    icon: "flash-outline",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99",
    period: "/mes",
    features: ["Todo lo de Basic", "Planes personalizados", "NutriciÃ³n guiada", "Analytics avanzados"],
    icon: "rocket-outline",
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29.99",
    period: "/mes",
    features: ["Todo lo de Pro", "Entrenador personal", "Consultas ilimitadas", "Plan premium exclusivo"],
    icon: "diamond-outline",
  },
];

export default function ChoosePlanScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState("pro");

  return (
    <SafeAreaView style={localStyles.container}>
      <View style={localStyles.stepIndicator}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View key={step} style={[localStyles.stepDot, { backgroundColor: step <= 3 ? C.primary : C.border }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <Text style={[localStyles.title, { color: C.textPrimary }]}>Elige tu plan</Text>
        <Text style={[localStyles.subtitle, { color: C.gray }]}>Selecciona el plan que mejor se adapte a tus necesidades</Text>

        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              localStyles.planCard,
              { backgroundColor: C.surface, borderColor: selectedPlan === plan.id ? C.primary : C.border },
              selectedPlan === plan.id && { borderColor: C.primary, backgroundColor: C.primary + "08" },
              plan.recommended && localStyles.recommendedCard,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.recommended && (
              <View style={[localStyles.recommendedBadge, { backgroundColor: C.primary }]}>
                <Text style={localStyles.recommendedText}>Recomendado</Text>
              </View>
            )}
            <View style={localStyles.planHeader}>
              <Ionicons name={plan.icon as any} size={28} color={selectedPlan === plan.id ? C.primary : C.gray} />
              <Text style={[localStyles.planName, { color: C.white }]}>{plan.name}</Text>
            </View>
            <View style={localStyles.priceRow}>
              <Text style={[localStyles.planPrice, { color: selectedPlan === plan.id ? C.primary : C.white }]}>{plan.price}</Text>
              <Text style={[localStyles.planPeriod, { color: C.gray }]}>{plan.period}</Text>
            </View>
            <View style={localStyles.divider} />
            {plan.features.map((feature, idx) => (
              <View key={idx} style={localStyles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={C.textPrimary} />
                <Text style={[localStyles.featureText, { color: C.white }]}>{feature}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[
                localStyles.selectBtn,
                { backgroundColor: selectedPlan === plan.id ? C.primary : C.gray40 },
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <Text style={[localStyles.selectBtnText, { color: selectedPlan === plan.id ? C.white : C.white }]}>
                Seleccionar
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={localStyles.bottomBar}>
        <TouchableOpacity
          style={[localStyles.continueBtn, { backgroundColor: C.primary }]}
          onPress={() => navigation.navigate("MigratedPrivacyPolicyOnboard")}
        >
          <Text style={[localStyles.continueBtnText, { color: C.white }]}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  stepIndicator: { flexDirection: "row", justifyContent: "center", gap: 8, paddingTop: 16 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontFamily: FONT.bold, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  planCard: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 2 },
  recommendedCard: {},
  recommendedBadge: { position: "absolute", top: -1, right: 16, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  recommendedText: { color: C.white, fontSize: 11, fontFamily: FONT.bold },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  planName: { fontSize: 18, fontFamily: FONT.bold },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 12 },
  planPrice: { fontSize: 28, fontFamily: FONT.bold },
  planPeriod: { fontSize: 14, marginLeft: 4 },
  divider: { height: 1, backgroundColor: C.gray40, marginBottom: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  featureText: { fontSize: 13 },
  selectBtn: { marginTop: 8, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  selectBtnText: { fontSize: 14, fontFamily: FONT.semiBold },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, backgroundColor: C.surface },
  continueBtn: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  continueBtnText: { fontSize: 16, fontFamily: FONT.bold },
});
