import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";
import { useAuth } from "@store/AuthContext";

const CONFETTI_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

function ConfettiDot({ delay, color, left }: { delay: number; color: string; left: `${number}%` }) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(1, { duration: 2000 })),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    transform: [{ translateY: anim.value * 300 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left,
          top: "10%",
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        },
        dotStyle,
      ]}
    />
  );
}

export default function OnboardingCompleteScreen({ navigation, route }: any) {
  const scaleAnim = useSharedValue(0);
  const { completeOnboarding, state } = useAuth();
  const isPersonalClient = !!state.user?.is_personal_client;
  const profile = state.user?.user_profile;
  const planSelected = !!route?.params?.planSelected;

  const checks = [
    { label: "Perfil completado", done: !!(profile?.weight && profile?.height) },
    { label: "Plan seleccionado", done: planSelected || isPersonalClient },
    { label: "Objetivos definidos", done: !!profile?.goal },
  ];

  useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 4, stiffness: 40 });
  }, []);

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <SafeAreaView style={localStyles.container}>
      {CONFETTI_COLORS.map((color, idx) =>
        [10, 25, 40, 55, 70, 85].map((l, i) => (
          <ConfettiDot key={`${idx}-${i}`} delay={idx * 300 + i * 200} color={color} left={`${l + idx * 2}%`} />
        ))
      )}

      <View style={localStyles.content}>
        <Animated.View style={[localStyles.iconContainer, { backgroundColor: C.primary }, scaleAnimatedStyle]}>
          <Ionicons name="trophy" size={64} color={C.white} />
        </Animated.View>

        <Text style={[localStyles.title, { color: C.textPrimary }]}>¡Todo listo!</Text>
        <Text style={[localStyles.subtitle, { color: C.gray }]}>
          {isPersonalClient
            ? "Tu entrenador revisará tu perfil y te contactará pronto para comenzar tu transformación."
            : "Explora la app y empieza tu transformación cuando quieras."}
        </Text>

        <View style={localStyles.checkList}>
          {checks.map((item, idx) => (
            <View key={idx} style={localStyles.checkRow}>
              <Ionicons name={item.done ? "checkmark-circle" : "ellipse-outline"} size={22} color={item.done ? C.textPrimary : C.gray} />
              <Text style={[localStyles.checkText, { color: item.done ? C.white : C.gray }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={localStyles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            localStyles.homeBtn,
            { backgroundColor: C.primary },
            pressed && { opacity: 0.2 },
          ]}
          onPress={async () => {
            await completeOnboarding();
            navigation.replace("Home");
          }}
        >
          <Text style={[localStyles.homeBtnText, { color: C.white }]}>Ir al inicio</Text>
          <Ionicons name="arrow-forward" size={18} color={C.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  iconContainer: { width: 130, height: 130, borderRadius: 65, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 28, fontFamily: FONT.bold, marginBottom: 12, textAlign: "center" },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 30 },
  checkList: { gap: 12, width: "100%" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkText: { fontSize: 15 },
  bottomBar: { padding: 20, paddingBottom: 30 },
  homeBtn: { flexDirection: "row", paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 8 },
  homeBtnText: { fontSize: 16, fontFamily: FONT.bold },
});
