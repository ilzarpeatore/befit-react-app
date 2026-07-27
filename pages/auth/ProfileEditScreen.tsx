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
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { useAuth } from "@store/AuthContext";
import { authApi } from "@api/auth";
import { Colors } from "@constants/colors";

export default function ProfileEditScreen() {
  const styles = useStyle();
  const navigation = useNavigation<any>();
  const { state, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(state.user?.display_name ?? "");
  const [phone, setPhone] = useState(state.user?.phone_number ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name is required");
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.updateProfile({
        display_name: displayName.trim(),
        phone_number: phone.trim(),
      });
      const updatedUser = response.data?.data;
      if (updatedUser) updateUser(updatedUser);
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update profile";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [displayName, phone, updateUser, navigation]);

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
                  <Text style={styles.masklabeltext}>Edit Profile</Text>
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
                  label="Display Name"
                  hint="Enter your display name"
                  prefixIcon="person-outline"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
                <AuthTextField
                  label="Email"
                  hint="Email cannot be changed"
                  prefixIcon="mail-outline"
                  value={state.user?.email ?? ""}
                  onChangeText={() => {}}
                  editable={false}
                />
                <AuthTextField
                  label="Phone"
                  hint="Enter your phone number"
                  prefixIcon="call-outline"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
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
