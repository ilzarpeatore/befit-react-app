import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "./theme";

export default function ForgotPasswordEmailScreen({ navigation }: any) {
  const styles = useStyle();
  const [email, setEmail] = useState("");

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.imgPlaceholder}>
            <Ionicons name="mail-open-outline" size={60} color={C.gray30} />
          </View>

          <Text style={styles.title}>Restablecer contraseÃ±a</Text>
          <Text style={styles.subtitle}>Ingresa tu correo electrÃ³nico y te enviaremos un enlace para restablecer tu contraseÃ±a.</Text>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={C.gray5} />
            <TextInput style={styles.input} placeholder="tucorreo@email.com" placeholderTextColor={C.gray20} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, !email && { opacity: 0.5 }]}
            disabled={!email}
            onPress={() => navigation.navigate("MigratedPasswordResetSentAuth")}
          >
            <Text style={styles.primaryBtnText}>Enviar enlace</Text>
          </TouchableOpacity>

          <View style={styles.helpRow}>
            <Text style={styles.helpText}>Â¿No recuerdas tu correo? </Text>
            <TouchableOpacity>
              <Text style={styles.helpLink}>help@sandow.ai</Text>
            </TouchableOpacity>
          </View>
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
    imgPlaceholder: { alignItems: "center", marginBottom: 32 },
    title: { fontSize: 24, fontFamily: FONT.bold, color: C.white, textAlign: "center" },
    subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray5, textAlign: "center", marginTop: 8, marginBottom: 32 },
    label: { fontSize: 13, fontFamily: FONT.semiBold, color: C.gray5, marginBottom: 6 },
    inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 24, gap: 10 },
    input: { flex: 1, fontSize: 15, fontFamily: FONT.regular, color: C.white },
    primaryBtn: { backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
    primaryBtnText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
    helpRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
    helpText: { fontSize: 13, fontFamily: FONT.regular, color: C.gray5 },
    helpLink: { fontSize: 13, fontFamily: FONT.semiBold, color: C.brand50 },
  });
}
