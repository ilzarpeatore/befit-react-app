import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "./theme";

export default function WelcomeAuthScreen({ navigation }: any) {
  const styles = useStyle();

  return (
    <View style={styles.root}>
      <LinearGradient colors={["rgba(26,23,53,0.3)", C.bg]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.iconBox}>
            <Ionicons name="fitness-outline" size={28} color={C.white} />
          </View>
          <Text style={styles.title}>Â¡Bienvenido a sandow.ai!</Text>
          <Text style={styles.subtitle}>Elige cÃ³mo quieres continuar.</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color={C.white} />
              <Text style={styles.btnText}>Continuar con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.facebookBtn} activeOpacity={0.8}>
              <Ionicons name="logo-facebook" size={20} color="#fff" />
              <Text style={[styles.btnText, { color: "#fff" }]}>Continuar con Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emailBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("MigratedSignIn")}
            >
              <Ionicons name="mail-outline" size={20} color={C.white} />
              <Text style={styles.btnText}>Continuar con Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Â¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("MigratedSignUp")}>
            <Text style={styles.footerLink}>RegÃ­strate</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: C.brand10,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    title: { fontSize: 24, fontFamily: FONT.bold, color: C.white, textAlign: "center" },
    subtitle: { fontSize: 15, fontFamily: FONT.regular, color: C.gray50, textAlign: "center", marginTop: 8, marginBottom: 40 },
    buttons: { width: "100%", gap: 14 },
    googleBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.gray40,
      borderRadius: 16,
      paddingVertical: 16,
      gap: 12,
    },
    facebookBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1877F2",
      borderRadius: 16,
      paddingVertical: 16,
      gap: 12,
    },
    emailBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.brand50,
      borderRadius: 16,
      paddingVertical: 16,
      gap: 12,
    },
    btnText: { fontSize: 15, fontFamily: FONT.semiBold, color: C.white },
    footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingBottom: 32 },
    footerText: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50 },
    footerLink: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray60 },
  });
}
