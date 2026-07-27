import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthPrimaryButton } from "@components/auth/AuthPrimaryButton";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

export default function PasswordResetSentScreen() {
  const navigation = useNavigation<any>();
  const styles = useStyle();

  return (
    <ImageBackground
      source={require("@assets/bg3.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-open-outline" size={64} color={Colors.ACCENT_START} />
          </View>

          <Text style={styles.heading}>Check Your Email</Text>
          <Text style={styles.subheading}>
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </Text>

          <AuthPrimaryButton
            label="Back to Login"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "LoginAuth" }] })}
          />
        </View>

        <StatusBar style="light" />
      </SafeAreaView>
    </ImageBackground>
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
      paddingHorizontal: "38@ratio",
      justifyContent: "center",
    },
    content: {
      alignItems: "center",
    },
    iconContainer: {
      width: "120@ratio",
      height: "120@ratio",
      borderRadius: "60@ratio",
      backgroundColor: "rgba(119,115,250,0.15)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "30@ratio",
    },
    heading: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "26@ratio",
      color: Colors.TEXT_PRIMARY,
      textAlign: "center",
      marginBottom: "12@ratio",
    },
    subheading: {
      fontFamily: "Gilroy-Regular",
      fontSize: "15@ratio",
      color: Colors.TEXT_SECONDARY,
      textAlign: "center",
      lineHeight: "22@ratio",
      marginBottom: "40@ratio",
      paddingHorizontal: "10@ratio",
    },
  });
}
