import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "./theme";

const OPTIONS = [
  { key: "email", icon: "mail-outline" as const, label: "Email", desc: "Recibe un enlace de recuperaciÃ³n en tu correo." },
  { key: "sms", icon: "chatbubble-outline" as const, label: "SMS", desc: "Recibe un cÃ³digo por mensaje de texto." },
  { key: "2fa", icon: "key-outline" as const, label: "AutenticaciÃ³n 2FA", desc: "Usa tu aplicaciÃ³n de autenticaciÃ³n." },
];

export default function ForgotPasswordOptionsScreen({ navigation }: any) {
  const styles = useStyle();

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Â¿Olvidaste tu contraseÃ±a?</Text>
          <Text style={styles.subtitle}>Elige el mÃ©todo de recuperaciÃ³n que prefieras.</Text>

          <View style={{ gap: 14, marginTop: 32 }}>
            {OPTIONS.map(o => (
              <TouchableOpacity
                key={o.key}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                  if (o.key === "email") navigation.navigate("MigratedForgotPasswordEmailAuth");
                }}
              >
                <View style={styles.iconBox}>
                  <Ionicons name={o.icon} size={24} color={C.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>{o.label}</Text>
                  <Text style={styles.cardDesc}>{o.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.gray50} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.imagePlaceholder}>
          <Ionicons name="shield-checkmark-outline" size={60} color={C.gray30} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    header: { paddingHorizontal: 16, paddingTop: 8 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, justifyContent: "center", alignItems: "center" },
    content: { paddingHorizontal: 24, paddingTop: 24 },
    title: { fontSize: 24, fontFamily: FONT.bold, color: C.white, textAlign: "center" },
    subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50, textAlign: "center", marginTop: 8 },
    card: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 14 },
    iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: C.brand10, justifyContent: "center", alignItems: "center" },
    cardLabel: { fontSize: 15, fontFamily: FONT.semiBold, color: C.white },
    cardDesc: { fontSize: 12, fontFamily: FONT.medium, color: C.gray50, marginTop: 2 },
    imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  });
}
