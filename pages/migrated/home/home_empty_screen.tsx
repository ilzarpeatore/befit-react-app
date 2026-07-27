import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const PROMPTS = [
  {
    title: "Set up your Sandow Score",
    desc: "Complete your profile to get a personalized fitness score",
    icon: "trophy",
    color: C.warning40,
    action: "Setup",
  },
  {
    title: "Add your first metric",
    desc: "Track heart rate, steps, weight and more",
    icon: "stats-chart",
    color: C.brand50,
    action: "Add",
  },
  {
    title: "Start a workout",
    desc: "Begin your first training session today",
    icon: "barbell",
    color: C.success50,
    action: "Start",
  },
];

const NAV_ITEMS = [
  { icon: "home", label: "Home", active: true },
  { icon: "stats-chart", label: "Metrics", active: false },
  { icon: "fitness", label: "Workouts", active: false },
  { icon: "person", label: "Profile", active: false },
];

export default function HomeEmptyScreen({ navigation }: any) {
  const styles = useStyle();

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.subtitle}>Let's get you started</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={C.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.scoreCard}>
            <Ionicons name="trophy" size={32} color={C.warning40} />
            <Text style={styles.scoreLabel}>Sandow Score</Text>
            <Text style={styles.scoreValue}>--</Text>
            <Text style={styles.scoreHint}>Complete setup to unlock</Text>
          </View>

          <Text style={styles.sectionTitle}>Get Started</Text>
          {PROMPTS.map((p, i) => (
            <View key={i} style={styles.promptCard}>
              <View style={[styles.promptIcon, { backgroundColor: p.color + "15" }]}>
                <Ionicons name={p.icon as any} size={24} color={p.color} />
              </View>
              <View style={styles.promptBody}>
                <Text style={styles.promptTitle}>{p.title}</Text>
                <Text style={styles.promptDesc}>{p.desc}</Text>
              </View>
              <TouchableOpacity style={[styles.promptBtn, { borderColor: p.color }]}>
                <Text style={[styles.promptBtnText, { color: p.color }]}>{p.action}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.navBar}>
          {NAV_ITEMS.map((item) => (
            <TouchableOpacity key={item.label} style={styles.navItem}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={item.active ? C.brand50 : C.gray10}
              />
              <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    content: { padding: 20, paddingBottom: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    greeting: { fontSize: 28, fontFamily: FONT.bold, color: C.white },
    subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray5, marginTop: 4 },
    notifBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      justifyContent: "center",
      alignItems: "center",
    },
    scoreCard: {
      alignItems: "center",
      backgroundColor: C.surface,
      borderRadius: 20,
      padding: 28,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 28,
    },
    scoreLabel: { fontSize: 14, fontFamily: FONT.regular, color: C.gray5, marginTop: 12 },
    scoreValue: { fontSize: 48, fontFamily: FONT.extraBold, color: C.white, marginTop: 4 },
    scoreHint: { fontSize: 13, fontFamily: FONT.regular, color: C.gray5, marginTop: 4 },
    sectionTitle: { fontSize: 18, fontFamily: FONT.semiBold, color: C.white, marginBottom: 12 },
    promptCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 12,
      gap: 12,
    },
    promptIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    promptBody: { flex: 1 },
    promptTitle: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
    promptDesc: { fontSize: 12, fontFamily: FONT.regular, color: C.gray5, marginTop: 2 },
    promptBtn: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    promptBtnText: { fontSize: 13, fontFamily: FONT.semiBold },
    navBar: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: C.surface,
      borderTopWidth: 1,
      borderTopColor: C.border,
      paddingVertical: 12,
      paddingBottom: 24,
    },
    navItem: { alignItems: "center", gap: 4 },
    navLabel: { fontSize: 11, fontFamily: FONT.medium, color: C.gray10 },
    navLabelActive: { color: C.brand50 },
  });
}
