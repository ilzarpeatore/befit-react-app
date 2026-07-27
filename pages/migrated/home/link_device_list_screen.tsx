import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const DEVICES = [
  { name: "Garmin", icon: "watch", desc: "Garmin smartwatch" },
  { name: "Fitbit", icon: "watch", desc: "Fitbit tracker" },
  { name: "Apple Watch", icon: "watch", desc: "Apple Watch Series" },
  { name: "Samsung Galaxy Watch", icon: "watch", desc: "Galaxy Watch series" },
];

export default function LinkDeviceListScreen({ navigation }: any) {
  const styles = useStyle();

  const handleConnect = () => {
    navigation.navigate("MigratedEmparejando");
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Select Device</Text>
          <Text style={styles.subtitle}>Choose your wearable to start syncing</Text>

          {DEVICES.map((device) => (
            <View key={device.name} style={styles.deviceCard}>
              <View style={styles.deviceIcon}>
                <Ionicons name={device.icon as any} size={28} color={C.brand50} />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceDesc}>{device.desc}</Text>
              </View>
              <TouchableOpacity style={styles.connectBtn} onPress={handleConnect}>
                <Text style={styles.connectBtnText}>Connect</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    subtitle: { fontSize: 15, fontFamily: FONT.regular, color: C.gray5, marginBottom: 28 },
    deviceCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 12,
      gap: 14,
    },
    deviceIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: C.brand10,
      justifyContent: "center",
      alignItems: "center",
    },
    deviceInfo: { flex: 1 },
    deviceName: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
    deviceDesc: { fontSize: 13, fontFamily: FONT.regular, color: C.gray5, marginTop: 2 },
    connectBtn: {
      backgroundColor: C.brand50,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    connectBtnText: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
  });
}
