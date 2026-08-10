import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { subscriptionApi, PackageItem } from "@api/subscription";
import { useAuth } from "@store/AuthContext";
import logger from "@helper/logger";

import { C, FONT } from "../theme";

export default function ChoosePlanScreen({ navigation }: any) {
  const { state } = useAuth();
  const isPersonalClient = !!state.user?.is_personal_client;
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // Cliente 1:1 ya tiene acceso completo, no le pedimos elegir plan (mismo
    // criterio que subscribe_screen.tsx/subscription_detail_screen.tsx).
    if (isPersonalClient) {
      setLoading(false);
      return;
    }
    loadPackages();
  }, [isPersonalClient]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await subscriptionApi.getPackageList();
      setPackages(res.data?.data || []);
    } catch (e) {
      logger.error("Failed to load packages in onboarding", e);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    // Sin plan real elegido (0 paquetes disponibles, o el usuario prefiere
    // decidir más tarde): seguir con el onboarding sin bloquear — el catálogo
    // real sigue disponible después desde MigratedSubscribe.
    if (isPersonalClient || selectedPlan === null) {
      navigation.navigate("MigratedPrivacyPolicyOnboard");
      return;
    }
    setSubscribing(true);
    try {
      // Fase 3 "Niveles de acceso" — sin pago real todavía (Fase 4), mismo
      // patrón que subscribe_screen.tsx: crea una Subscription real sin cobro.
      await subscriptionApi.subscribeToPackage(selectedPlan);
      navigation.navigate("MigratedPrivacyPolicyOnboard");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "No se pudo completar la suscripción. Puedes elegir un plan más tarde desde tu perfil.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <SafeAreaView style={localStyles.container}>
      <View style={localStyles.stepIndicator}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View key={step} style={[localStyles.stepDot, { backgroundColor: step <= 3 ? C.primary : C.border }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <Text style={[localStyles.title, { color: C.textPrimary }]}>Elige tu plan</Text>

        {isPersonalClient ? (
          <View style={localStyles.emptyState}>
            <Ionicons name="checkmark-circle" size={40} color={C.primary} style={{ marginBottom: 12 }} />
            <Text style={[localStyles.emptyText, { color: C.white }]}>
              Ya tienes acceso completo como cliente de entrenamiento personal 1:1 — no necesitas elegir ningún plan.
            </Text>
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 40 }} />
        ) : packages.length === 0 ? (
          <View style={localStyles.emptyState}>
            <Ionicons name="time-outline" size={40} color={C.gray} style={{ marginBottom: 12 }} />
            <Text style={[localStyles.emptyText, { color: C.white }]}>
              Aún no hay planes de pago publicados. Puedes seguir explorando la app gratis y suscribirte más adelante desde tu perfil, en cuanto haya planes disponibles.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[localStyles.subtitle, { color: C.gray }]}>Selecciona el plan que mejor se adapte a tus necesidades</Text>
            {packages.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  localStyles.planCard,
                  { backgroundColor: C.surface, borderColor: selectedPlan === plan.id ? C.primary : C.border },
                  selectedPlan === plan.id && { borderColor: C.primary, backgroundColor: C.primary + "08" },
                ]}
                onPress={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
              >
                <View style={localStyles.planHeader}>
                  <Ionicons name="rocket-outline" size={28} color={selectedPlan === plan.id ? C.primary : C.gray} />
                  <Text style={[localStyles.planName, { color: C.white }]}>{plan.name}</Text>
                </View>
                <View style={localStyles.priceRow}>
                  <Text style={[localStyles.planPrice, { color: selectedPlan === plan.id ? C.primary : C.white }]}>${Number(plan.price ?? 0).toFixed(2)}</Text>
                  <Text style={[localStyles.planPeriod, { color: C.gray }]}>/ {plan.duration} {plan.duration_unit}{plan.duration > 1 ? 's' : ''}</Text>
                </View>
                {(plan.training_program_title || plan.meal_plan_template_title) && (
                  <View style={localStyles.divider} />
                )}
                {plan.training_program_title && (
                  <View style={localStyles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={C.textPrimary} />
                    <Text style={[localStyles.featureText, { color: C.white }]}>Entrenamiento: {plan.training_program_title}</Text>
                  </View>
                )}
                {plan.meal_plan_template_title && (
                  <View style={localStyles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={C.textPrimary} />
                    <Text style={[localStyles.featureText, { color: C.white }]}>Nutrición: {plan.meal_plan_template_title}</Text>
                  </View>
                )}
                {!!plan.description && (
                  <Text style={[localStyles.featureText, { color: C.gray, marginTop: 8 }]}>{plan.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <View style={localStyles.bottomBar}>
        <TouchableOpacity
          style={[localStyles.continueBtn, { backgroundColor: C.primary, opacity: subscribing ? 0.7 : 1 }]}
          onPress={handleContinue}
          disabled={subscribing}
        >
          {subscribing ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={[localStyles.continueBtnText, { color: C.white }]}>
              {!isPersonalClient && selectedPlan !== null ? "Suscribirme y continuar" : "Continuar"}
            </Text>
          )}
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
  emptyState: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
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
