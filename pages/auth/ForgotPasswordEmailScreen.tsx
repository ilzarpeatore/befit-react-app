import React, { useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import MaskedView from "@react-native-masked-view/masked-view";
import { useNavigation } from "@react-navigation/native";
import { AuthTextField } from "@components/auth/AuthTextField";
import { AuthPrimaryButton } from "@components/auth/AuthPrimaryButton";
import { AuthErrorBanner } from "@components/auth/AuthErrorBanner";
import { AuthLinkRow } from "@components/auth/AuthLinkRow";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { authApi } from "@api/auth";
import { Colors } from "@constants/colors";

export default function ForgotPasswordEmailScreen() {
  const navigation = useNavigation<any>();
  const styles = useStyle();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendLink = async () => {
    if (!email.trim()) {
      setError("Introduce tu email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword({ email: email.trim() });
      navigation.navigate("ResetSent");
    } catch (err: any) {
      const message = err.response?.data?.message || "No se pudo enviar el enlace de restablecimiento";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={styles.bg}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* title */}
          <MaskedView
            style={styles.masklabel}
            maskElement={
              <View style={styles.masklabelview}>
                <Text style={styles.masklabeltext}>Nueva</Text>
              </View>
            }
          >
            <ImageBackground
              source={require("@assets/pagetitlemask2.png")}
              style={styles.masklabelimg}
              imageStyle={styles.masklabelimgresize}
            />
          </MaskedView>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.heading}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subheading}>
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </Text>

            {error ? (
              <AuthErrorBanner message={error} onDismiss={() => setError("")} />
            ) : null}

            <AuthTextField
              label="Email"
              hint="Introduce tu email"
              prefixIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View style={styles.buttonContainer}>
              <AuthPrimaryButton
                label="Enviar enlace"
                onPress={handleSendLink}
                loading={loading}
              />
            </View>

            <AuthLinkRow
              prefix="¿Recuerdas tu contraseña?"
              linkText="Volver a iniciar sesión"
              onPress={() => navigation.goBack()}
            />
          </ScrollView>
        </KeyboardAvoidingView>
        <StatusBar style="dark" />
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    bg: {
      width: "100%",
      height: "100%",
      backgroundColor: Colors.BG_PRIMARY,
    },
    container: {
      flex: 1,
    },
    masklabel: {
      height: "49@ratio",
      marginBottom: "20@ratio",
      marginHorizontal: "38@ratio",
    },
    masklabelview: {
      backgroundColor: "transparent",
      height: "49@ratio",
      alignItems: "center",
      justifyContent: "center",
    },
    masklabeltext: {
      fontSize: "36@ratio",
      color: Colors.TEXT_PRIMARY,
      fontFamily: "Gilroy-ExtraBold",
    },
    masklabelimg: {
      width: "100%",
      height: "200@ratio",
      marginTop: "-55@ratio",
    },
    masklabelimgresize: {
      resizeMode: "cover",
    },
    scrollContent: {
      paddingHorizontal: "38@ratio",
      paddingBottom: "30@ratio",
    },
    heading: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "24@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "8@ratio",
    },
    subheading: {
      fontFamily: "Gilroy-Regular",
      fontSize: "15@ratio",
      color: Colors.TEXT_SECONDARY,
      marginBottom: "24@ratio",
      lineHeight: "22@ratio",
    },
    buttonContainer: {
      marginTop: "20@ratio",
    },
  });
}
