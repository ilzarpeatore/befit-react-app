import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";

export default function NotificationsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={localStyles.container}>
      <View style={localStyles.content}>
        <View style={[localStyles.iconContainer, { backgroundColor: C.primary + "15" }]}>
          <Ionicons name="notifications" size={64} color={C.textPrimary} />
        </View>

        <Text style={[localStyles.title, { color: C.textPrimary }]}>Activar notificaciones</Text>
        <Text style={[localStyles.subtitle, { color: C.gray }]}>
          Recibe recordatorios para alcanzar tus objetivos fitness, sesiones de entrenamiento y consejos personalizados.
        </Text>

        <View style={localStyles.previewCard}>
          <View style={localStyles.previewHeader}>
            <Ionicons name="fitness" size={20} color={C.textPrimary} />
            <Text style={[localStyles.previewAppName, { color: C.textPrimary }]}>MightyFitness</Text>
          </View>
          <Text style={[localStyles.previewTitle, { color: C.white }]}>Â¡Hora de entrenar! ðŸ'ª</Text>
          <Text style={[localStyles.previewBody, { color: C.gray }]}>Tu sesiÃ³n de cardio de 30 min te espera. Â¡Dale!</Text>
          <Text style={[localStyles.previewTime, { color: C.gray }]}>ahora</Text>
        </View>
      </View>

      <View style={localStyles.bottomBar}>
        <TouchableOpacity
          style={[localStyles.activateBtn, { backgroundColor: C.primary }]}
          onPress={() => navigation.navigate("MigratedAssessmentResult")}
        >
          <Ionicons name="notifications-outline" size={18} color={C.white} />
          <Text style={localStyles.activateBtnText}>Activar todas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={localStyles.skipBtn} onPress={() => navigation.navigate("MigratedAssessmentResult")}>
          <Text style={[localStyles.skipBtnText, { color: C.gray }]}>Omitir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  iconContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 28, fontFamily: FONT.bold, marginBottom: 12, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 30 },
  previewCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, width: "100%", marginBottom: 20 },
  previewHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  previewAppName: { fontSize: 13, fontFamily: FONT.semiBold },
  previewTitle: { fontSize: 15, fontFamily: FONT.bold, marginBottom: 4 },
  previewBody: { fontSize: 13, marginBottom: 4 },
  previewTime: { fontSize: 11 },
  bottomBar: { padding: 20, paddingBottom: 30 },
  activateBtn: { flexDirection: "row", paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  activateBtnText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  skipBtn: { paddingVertical: 14, alignItems: "center" },
  skipBtnText: { fontSize: 15, fontFamily: FONT.semiBold },
});
