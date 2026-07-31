import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "./theme";

export default function LoginScreen({ navigation }: any) {
  const styles = useStyle();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) { setError("Por favor completa todos los campos."); return; }
    setError("");
    navigation.replace("Home");
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.logoBox}>
            <Ionicons name="fitness-outline" size={24} color={C.gray60} />
            <Text style={styles.logoText}>sandow.ai</Text>
          </View>
          <Text style={styles.title}>Iniciar SesiÃ³n</Text>
          <Text style={styles.subtitle}>Bienvenido de nuevo. Ingresa tus datos.</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={C.destructive50} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={C.gray50} />
            <TextInput style={styles.input} placeholder="tucorreo@email.com" placeholderTextColor={C.gray40} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Text style={styles.label}>ContraseÃ±a</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={C.gray50} />
            <TextInput style={styles.input} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" placeholderTextColor={C.gray40} value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={C.gray50} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.checkRow} onPress={() => setRemember(!remember)}>
              <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                {remember && <Ionicons name="checkmark" size={14} color={C.white} />}
              </View>
              <Text style={styles.checkLabel}>Mantener sesiÃ³n</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("MigratedForgotPasswordOptionsAuth")}>
              <Text style={styles.forgotLink}>Â¿Olvidaste tu contraseÃ±a?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
            <Text style={styles.primaryBtnText}>Iniciar sesiÃ³n</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>o</Text>
            <View style={styles.divLine} />
          </View>

          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-google" size={20} color={C.white} />
            <Text style={styles.socialText}>Iniciar sesiÃ³n con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={() => navigation.navigate("MigratedOTP")}>
            <Ionicons name="call-outline" size={20} color={C.white} />
            <Text style={styles.socialText}>Iniciar sesiÃ³n con telÃ©fono</Text>
          </TouchableOpacity>
        </ScrollView>

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
    scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    logoBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 32, gap: 8 },
    logoText: { fontSize: 18, fontFamily: FONT.bold, color: C.white, letterSpacing: 1 },
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, textAlign: "center" },
    subtitle: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50, textAlign: "center", marginTop: 8, marginBottom: 28 },
    errorBanner: { flexDirection: "row", alignItems: "center", backgroundColor: C.destructive5, borderRadius: 12, padding: 12, marginBottom: 16, gap: 8 },
    errorText: { fontSize: 13, fontFamily: FONT.medium, color: C.destructive50 },
    label: { fontSize: 13, fontFamily: FONT.semiBold, color: C.gray50, marginBottom: 6 },
    inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16, gap: 10 },
    input: { flex: 1, fontSize: 15, fontFamily: FONT.regular, color: C.white },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: C.gray30, justifyContent: "center", alignItems: "center" },
    checkboxOn: { backgroundColor: C.brand50, borderColor: C.brand50 },
    checkLabel: { fontSize: 13, fontFamily: FONT.medium, color: C.gray50 },
    forgotLink: { fontSize: 13, fontFamily: FONT.semiBold, color: C.gray60 },
    primaryBtn: { backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 20 },
    primaryBtnText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
    divider: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    divLine: { flex: 1, height: 1, backgroundColor: C.border },
    divText: { fontSize: 13, fontFamily: FONT.medium, color: C.gray50, marginHorizontal: 16 },
    socialBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.gray40, borderRadius: 14, paddingVertical: 14, marginBottom: 12, gap: 10 },
    socialText: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
    footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingBottom: 24 },
    footerText: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50 },
    footerLink: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray60 },
  });
}
