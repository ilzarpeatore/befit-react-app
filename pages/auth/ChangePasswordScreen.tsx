import React, { useCallback, useState } from "react";
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
import { PasswordStrengthBar } from "@components/auth/PasswordStrengthBar";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { authApi } from "@api/auth";
import { Colors } from "@constants/colors";

export default function ChangePasswordScreen() {
  const styles = useStyle();
  const navigation = useNavigation<any>();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = useCallback(async () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      Alert.alert("Success", "Password changed successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to change password";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [oldPassword, newPassword, confirmPassword, navigation]);

  return (
    <ImageBackground
      source={require("@assets/bg3.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.container2}>
            <MaskedView
              style={styles.masklabel}
              maskElement={
                <View style={styles.masklabelview}>
                  <Text style={styles.masklabeltext}>Change Password</Text>
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
              <View style={styles.inputSection}>
                <AuthTextField
                  label="Current Password"
                  hint="Enter your current password"
                  prefixIcon="lock-closed-outline"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                />
                <AuthTextField
                  label="New Password"
                  hint="Enter your new password"
                  prefixIcon="lock-closed-outline"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <PasswordStrengthBar password={newPassword} />
                <AuthTextField
                  label="Confirm New Password"
                  hint="Re-enter your new password"
                  prefixIcon="lock-closed-outline"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />

                <AuthPrimaryButton
                  label="Save"
                  onPress={handleSave}
                  loading={loading}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
        <StatusBar style="dark" />
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
    },
    container2: {
      flex: 1,
      paddingTop: "64@ratio",
    },
    masklabel: {
      height: "49@ratio",
      marginBottom: "30@ratio",
      marginHorizontal: "38@ratio",
    },
    masklabelview: {
      backgroundColor: "transparent",
      height: "49@ratio",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    masklabeltext: {
      fontSize: "40@ratio",
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
    inputSection: {
      marginTop: "8@ratio",
    },
  });
}
