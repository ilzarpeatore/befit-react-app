import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

export default function ParqResultScreen({ navigation, route }: any) {
  const styles = useStyle();
  const cleared = route?.params?.cleared ?? true;

  const profile = {
    name: "Makise",
    age: "28",
    weight: "70 kg",
    height: "175 cm",
    goal: "Ganar mÃºsculo",
    activity: "Moderado",
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.iconCircle, cleared ? styles.iconGreen : styles.iconOrange]}>
            <Ionicons name={cleared ? "checkmark-circle" : "warning"} size={48} color={cleared ? C.success50 : C.warning50} />
          </View>

          <Text style={styles.title}>{cleared ? "Â¡Listo para entrenar!" : "Consulta mÃ©dica recomendada"}</Text>
          <Text style={styles.desc}>
            {cleared
              ? "Has completado el cuestionario PAR-Q exitosamente. No se identificaron riesgos para tu salud al realizar ejercicio."
              : "Basado en tus respuestas, te recomendamos consultar con un mÃ©dico antes de iniciar un programa de ejercicio fÃ­sico."}
          </Text>

          <View style={styles.profileCard}>
            <Text style={styles.profileTitle}>Resumen del perfil</Text>
            <ProfileRow icon="person-outline" label="Nombre" value={profile.name} />
            <ProfileRow icon="calendar-outline" label="Edad" value={profile.age} />
            <ProfileRow icon="scale-outline" label="Peso" value={profile.weight} />
            <ProfileRow icon="resize-outline" label="Altura" value={profile.height} />
            <ProfileRow icon="flag-outline" label="Objetivo" value={profile.goal} />
            <ProfileRow icon="flash-outline" label="Actividad" value={profile.activity} />
            <ProfileRow icon={cleared ? "checkmark-circle-outline" : "alert-circle-outline"} label="PAR-Q" value={cleared ? "Aprobado" : "Requiere revisiÃ³n"} />
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace("FitnessAssessment")}
          >
            <Text style={styles.primaryBtnText}>{cleared ? "Siguiente" : "Entendido, continuar"}</Text>
          </TouchableOpacity>

          {!cleared && (
            <TouchableOpacity style={styles.retryLink} onPress={() => navigation.replace("Parq")}>
              <Text style={styles.retryText}>Repetir encuesta PAR-Q</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={prStyles.row}>
      <Ionicons name={icon as any} size={18} color={C.gray50} />
      <Text style={prStyles.label}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text style={prStyles.value}>{value}</Text>
    </View>
  );
}

const prStyles = {
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 } as const,
  label: { fontSize: 14, fontFamily: FONT.medium, color: C.gray50 } as const,
  value: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white } as const,
};

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32, alignItems: "center" },
    iconCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: "center", alignItems: "center", marginBottom: 24 },
    iconGreen: { backgroundColor: C.success5 },
    iconOrange: { backgroundColor: C.warning5 },
    title: { fontSize: 24, fontFamily: FONT.bold, color: C.white, textAlign: "center" },
    desc: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50, textAlign: "center", marginTop: 8, marginBottom: 28, lineHeight: 22 },
    profileCard: { width: "100%", backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20, marginBottom: 24 },
    profileTitle: { fontSize: 16, fontFamily: FONT.bold, color: C.white, marginBottom: 8 },
    primaryBtn: { backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, alignItems: "center", width: "100%" },
    primaryBtnText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
    retryLink: { marginTop: 16 },
    retryText: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray50 },
  });
}
