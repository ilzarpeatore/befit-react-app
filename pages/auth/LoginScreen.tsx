import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@store/AuthContext";
import { Colors } from "@constants/colors";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim(), password, user_type: "user" });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Login failed";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.TEXT_MUTED}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotOptions")}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleBtn}>
            <Ionicons name="logo-google" size={20} color={Colors.TEXT_PRIMARY} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("RegisterFlow")}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: Colors.BG_PRIMARY } as const,
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 32 } as const,
  backBtn: { width: 40, height: 40, justifyContent: "center" as const, marginBottom: 16 } as const,
  title: { fontFamily: "Gilroy-ExtraBold" as const, fontSize: 30, color: Colors.TEXT_PRIMARY, marginBottom: 6 } as const,
  subtitle: { fontFamily: "Gilroy-Regular" as const, fontSize: 16, color: Colors.TEXT_SECONDARY, marginBottom: 32 } as const,
  inputGroup: { marginBottom: 20 } as const,
  label: { fontFamily: "Gilroy-Medium" as const, fontSize: 14, color: Colors.TEXT_SECONDARY, marginBottom: 8 } as const,
  inputWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.BG_CARD || "#141227",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.TEXT_MUTED || "#2A2844",
  } as const,
  inputIcon: { marginLeft: 14 } as const,
  input: { flex: 1, height: 52, paddingHorizontal: 12, fontFamily: "Gilroy-Regular" as const, fontSize: 16, color: Colors.TEXT_PRIMARY } as const,
  eyeBtn: { paddingHorizontal: 14 } as const,
  btn: {
    backgroundColor: Colors.ACCENT_START || "#E3DCD9",
    borderRadius: 14,
    height: 54,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 8,
    marginBottom: 16,
  } as const,
  btnDisabled: { opacity: 0.6 } as const,
  btnText: { fontFamily: "Gilroy-Bold" as const, fontSize: 17, color: "#1C1C1E" } as const,
  forgotBtn: { alignItems: "flex-end" as const, marginBottom: 24 } as const,
  // Texto de enlace: ACCENT_START/ACCENT_ACTIVE son ahora beige claro (E3DCD9),
  // ilegibles como color de TEXTO sobre fondo claro - se usa TEXT_PRIMARY
  // (#1C1C1E) en su lugar, el peso "Bold" ya distingue el enlace visualmente.
  forgotText: { fontFamily: "Gilroy-Medium" as const, fontSize: 14, color: Colors.TEXT_PRIMARY || "#1C1C1E" } as const,
  dividerRow: { flexDirection: "row" as const, alignItems: "center" as const, marginBottom: 24 } as const,
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.TEXT_MUTED || "#2A2844" } as const,
  dividerText: { fontFamily: "Gilroy-Medium" as const, fontSize: 13, color: Colors.TEXT_SECONDARY, marginHorizontal: 16 } as const,
  googleBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.BG_CARD || "#141227",
    borderRadius: 14,
    height: 54,
    borderWidth: 1,
    borderColor: Colors.TEXT_MUTED || "#2A2844",
    marginBottom: 32,
    gap: 10,
  } as const,
  googleBtnText: { fontFamily: "Gilroy-Medium" as const, fontSize: 15, color: Colors.TEXT_PRIMARY } as const,
  footer: { flexDirection: "row" as const, justifyContent: "center" as const, alignItems: "center" } as const,
  footerText: { fontFamily: "Gilroy-Regular" as const, fontSize: 15, color: Colors.TEXT_SECONDARY } as const,
  footerLink: { fontFamily: "Gilroy-Bold" as const, fontSize: 15, color: Colors.TEXT_PRIMARY || "#1C1C1E" } as const,
};
