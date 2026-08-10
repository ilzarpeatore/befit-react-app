import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { isHealthAvailable, requestHealthPermissions } from "@helper/health";
import { C, FONT } from "../theme";

const HEALTH_APP_NAME = Platform.OS === "ios" ? "Apple Salud" : "Health Connect";

export default function LinkDeviceChoiceScreen({ navigation }: any) {
  const styles = useStyle();
  const [connecting, setConnecting] = useState(false);

  const handleConnectHealthApp = async () => {
    setConnecting(true);
    try {
      const available = await isHealthAvailable();
      if (!available) {
        Alert.alert(
          `${HEALTH_APP_NAME} no disponible`,
          Platform.OS === "android"
            ? "Instala la app Health Connect desde Play Store para poder sincronizar tus datos."
            : "Este dispositivo no tiene Salud disponible."
        );
        return;
      }
      const result = await requestHealthPermissions();
      if (result.granted) {
        navigation.replace("MigratedDeviceConnected", { source: "health" });
      } else {
        Alert.alert(
          "Permiso no concedido",
          `Puedes activar el acceso más tarde desde los ajustes de ${HEALTH_APP_NAME}.`
        );
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Connect your device</Text>
          <Text style={styles.subtitle}>Choose how you want to track your fitness data</Text>

          <TouchableOpacity
            style={styles.optionTile}
            activeOpacity={0.7}
            onPress={handleConnectHealthApp}
            disabled={connecting}
          >
            <View style={[styles.optionIcon, { backgroundColor: C.brand10 }]}>
              {connecting ? (
                <ActivityIndicator color={C.textPrimary} />
              ) : (
                <Ionicons name="heart" size={32} color={C.textPrimary} />
              )}
            </View>
            <Text style={styles.optionTitle}>{HEALTH_APP_NAME}</Text>
            <Text style={styles.optionDesc}>Sincroniza pasos, ritmo cardíaco y más</Text>
            <Ionicons name="chevron-forward" size={20} color={C.gray50} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionTile}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("MigratedLinkDeviceList")}
          >
            <View style={[styles.optionIcon, { backgroundColor: C.brand10 }]}>
              <Ionicons name="watch" size={32} color={C.textPrimary} />
            </View>
            <Text style={styles.optionTitle}>Wearable Device</Text>
            <Text style={styles.optionDesc}>Connect via Bluetooth</Text>
            <Ionicons name="chevron-forward" size={20} color={C.gray50} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionTile}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("MigratedLogStepsForm")}
          >
            <View style={[styles.optionIcon, { backgroundColor: C.success5 }]}>
              <Ionicons name="create-outline" size={32} color={C.success50} />
            </View>
            <Text style={styles.optionTitle}>Manual Entry</Text>
            <Text style={styles.optionDesc}>Log steps manually</Text>
            <Ionicons name="chevron-forward" size={20} color={C.gray50} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpBtn}>
            <Ionicons name="help-circle-outline" size={20} color={C.textPrimary} />
            <Text style={styles.helpText}>Need help connecting?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    content: { flex: 1, padding: 20, paddingBottom: 40 },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    title: { fontSize: 28, fontFamily: FONT.bold, color: C.white, marginBottom: 8 },
    subtitle: { fontSize: 15, fontFamily: FONT.regular, color: C.gray50, marginBottom: 32 },
    optionTile: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.surface,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 16,
      gap: 16,
    },
    optionIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    optionTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white, flex: 1 },
    optionDesc: { fontSize: 13, fontFamily: FONT.regular, color: C.gray50, position: "absolute", bottom: 20, left: 92 },
    helpBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 20,
    },
    helpText: { fontSize: 14, fontFamily: FONT.medium, color: C.textPrimary },
  });
}
