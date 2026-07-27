import React, { useCallback } from "react";
import {
  Text,
  View,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { useAuth } from "../store/AuthContext";

interface Props {
  navigation: any;
}

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen?: string;
  isPlaceholder?: boolean;
}

const settingsItems: SettingItem[] = [
  { icon: "person-outline", label: "Edit Profile", screen: "ProfileEdit" },
  { icon: "lock-closed-outline", label: "Change Password", screen: "ChangePassword" },
  { icon: "notifications-outline", label: "Notifications", isPlaceholder: true },
  { icon: "shield-checkmark-outline", label: "Privacy", isPlaceholder: true },
  { icon: "information-circle-outline", label: "About", screen: "MigratedAboutApp" },
];

export default function SettingsScreen({ navigation }: Props) {
  const styles = useStyle();
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch {}
        },
      },
    ]);
  }, [logout]);

  const handleItemPress = useCallback(
    (item: SettingItem) => {
      if (item.isPlaceholder) {
        Alert.alert("Coming Soon", "This feature is under development.");
        return;
      }
      if (item.screen) {
        navigation.navigate(item.screen);
      }
    },
    [navigation]
  );

  return (
    <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.TEXT_PRIMARY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                onPress={() => handleItemPress(item)}
                style={[
                  styles.settingRow,
                  index < settingsItems.length - 1 && styles.settingRowBorder,
                ]}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={Colors.TEXT_SECONDARY}
                    />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.TEXT_MUTED}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>DANGER ZONE</Text>
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <View style={styles.dangerIconContainer}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.DANGER} />
                </View>
                <Text style={styles.dangerLabel}>Logout</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.DANGER}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>BeFit v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
      <StatusBar style="light" />
    </ImageBackground>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    bg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      backgroundColor: Colors.BG_PRIMARY,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: "16@ratio",
      paddingVertical: "12@ratio",
    },
    backBtn: {
      width: "40@ratio",
      height: "40@ratio",
      borderRadius: "20@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
      textAlign: "center",
    },
    headerSpacer: {
      width: "40@ratio",
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "40@ratio",
    },
    sectionLabel: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "12@ratio" as any,
      color: Colors.TEXT_MUTED,
      letterSpacing: "1@ratio" as any,
      marginBottom: "8@ratio",
      marginTop: "20@ratio",
      marginLeft: "4@ratio",
    },
    card: {
      backgroundColor: Colors.BG_CARD,
      borderRadius: "16@ratio",
      overflow: "hidden",
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: "16@ratio",
      paddingVertical: "16@ratio",
    },
    settingRowBorder: {
      borderBottomWidth: "1@ratio",
      borderBottomColor: "rgba(138,140,178,0.12)",
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: "14@ratio",
    },
    settingIconContainer: {
      width: "36@ratio",
      height: "36@ratio",
      borderRadius: "10@ratio",
      backgroundColor: "rgba(138,140,178,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    settingLabel: {
      fontFamily: "Gilroy-Medium",
      fontSize: "15@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    dangerIconContainer: {
      width: "36@ratio",
      height: "36@ratio",
      borderRadius: "10@ratio",
      backgroundColor: "rgba(248,83,101,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    dangerLabel: {
      fontFamily: "Gilroy-Medium",
      fontSize: "15@ratio",
      color: Colors.DANGER,
    },
    versionText: {
      fontFamily: "Gilroy-Regular",
      fontSize: "13@ratio",
      color: Colors.TEXT_MUTED,
      textAlign: "center",
      marginTop: "32@ratio",
    },
  });
}
