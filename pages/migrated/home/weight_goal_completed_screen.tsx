import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const BADGES = [
  { icon: "flash" as const, label: "+5 puntos Sandow", color: C.warning40 },
  { icon: "trending-down" as const, label: "-5 kg logrados", color: C.success50 },
  { icon: "trophy" as const, label: "Constancia", color: C.brand50 },
];

export default function WeightGoalCompletedScreen({ navigation }: any) {
  const styles = useStyle();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Animated.View style={[styles.trophyCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="trophy" size={56} color={C.warning40} />
          </Animated.View>

          <Animated.View style={{ opacity: opacityAnim, alignItems: "center" }}>
            <Text style={styles.title}>{"\u00A1Meta de peso alcanzada!"}</Text>
            <Text style={styles.weightRange}>70.0 {"\u2192"} 65.0 kg</Text>
          </Animated.View>

          <Animated.View style={[styles.badgesContainer, { opacity: opacityAnim }]}>
            {BADGES.map((b, i) => (
              <View key={i} style={[styles.badge, { borderColor: b.color }]}>
                <Ionicons name={b.icon} size={18} color={b.color} />
                <Text style={[styles.badgeText, { color: b.color }]}>{b.label}</Text>
              </View>
            ))}
          </Animated.View>

          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate("HomePage")}>
            <Text style={styles.continueBtnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
    trophyCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(251,191,36,0.12)", justifyContent: "center", alignItems: "center", marginBottom: 32, borderWidth: 2, borderColor: C.warning40 },
    title: { fontSize: 24, fontFamily: FONT.bold, color: C.white, textAlign: "center", marginBottom: 12 },
    weightRange: { fontSize: 18, fontFamily: FONT.semiBold, color: C.warning40, textAlign: "center", marginBottom: 36 },
    badgesContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 48 },
    badge: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, gap: 6 },
    badgeText: { fontSize: 13, fontFamily: FONT.semiBold },
    continueBtn: { backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 64 },
    continueBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  });
}
