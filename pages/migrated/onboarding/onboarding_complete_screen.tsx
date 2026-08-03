import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";
import { useAuth } from "@store/AuthContext";

const CONFETTI_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

function ConfettiDot({ delay, color, left }: { delay: number; color: string; left: `${number}%` }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left,
        top: "10%",
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 300] }) }],
      }}
    />
  );
}

export default function OnboardingCompleteScreen({ navigation }: any) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const { completeOnboarding } = useAuth();

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={localStyles.container}>
      {CONFETTI_COLORS.map((color, idx) =>
        [10, 25, 40, 55, 70, 85].map((l, i) => (
          <ConfettiDot key={`${idx}-${i}`} delay={idx * 300 + i * 200} color={color} left={`${l + idx * 2}%`} />
        ))
      )}

      <View style={localStyles.content}>
        <Animated.View style={[localStyles.iconContainer, { backgroundColor: C.primary, transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="trophy" size={64} color={C.white} />
        </Animated.View>

        <Text style={[localStyles.title, { color: C.textPrimary }]}>Â¡Todo listo!</Text>
        <Text style={[localStyles.subtitle, { color: C.gray }]}>
          Tu entrenador te contactarÃ¡ pronto para comenzar tu transformaciÃ³n.
        </Text>

        <View style={localStyles.checkList}>
          {["Perfil completado", "Plan seleccionado", "Objetivos definidos"].map((item, idx) => (
            <View key={idx} style={localStyles.checkRow}>
              <Ionicons name="checkmark-circle" size={22} color={C.textPrimary} />
              <Text style={[localStyles.checkText, { color: C.white }]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={localStyles.bottomBar}>
        <TouchableOpacity
          style={[localStyles.homeBtn, { backgroundColor: C.primary }]}
          onPress={async () => {
            await completeOnboarding();
            navigation.replace("Home");
          }}
        >
          <Text style={[localStyles.homeBtnText, { color: C.white }]}>Ir al inicio</Text>
          <Ionicons name="arrow-forward" size={18} color={C.white} />
        </TouchableOpacity>
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
