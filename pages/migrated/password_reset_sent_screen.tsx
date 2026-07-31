import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "./theme";

export default function PasswordResetSentScreen({ navigation }: any) {
  const styles = useStyle();

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.imgPlaceholder}>
            <Ionicons name="mail-outline" size={60} color={C.gray30} />
          </View>

          <Text style={styles.title}>Â¡Enlace enviado!</Text>
          <Text style={styles.subtitle}>Hemos enviado un enlace de recuperaciÃ³n a tu correo electrÃ³nico. Revisa tu bandeja de entrada.</Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert("Abriendo correo...")}>
            <Ionicons name="mail" size={20} color={C.white} />
            <Text style={styles.primaryBtnText}>Abrir mi correo</Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Â¿AÃºn no has recibido? </Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Reenviar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <Text style={styles.loginLink}>Volver a iniciar sesiÃ³n</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    content: { flex: 1, paddingHorizontal: 24, justifyContent: "center", alignItems: "center" },
    imgPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: C.surface, justifyContent: "center", alignItems: "center", marginBottom: 32 },
    title: { fontSize: 24, fontFamily: FONT.bold, color: C.white, textAlign: "center" },
    subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50, textAlign: "center", marginTop: 8, marginBottom: 32, lineHeight: 22 },
    primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, gap: 10, width: "100%" },
    primaryBtnText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
    resendRow: { flexDirection: "row", marginTop: 20 },
    resendText: { fontSize: 13, fontFamily: FONT.regular, color: C.gray50 },
    resendLink: { fontSize: 13, fontFamily: FONT.semiBold, color: C.gray60 },
    footer: { alignItems: "center", paddingBottom: 32 },
    loginLink: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray60 },
  });
}
