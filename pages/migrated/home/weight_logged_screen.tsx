import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

export default function WeightLoggedScreen({ navigation }: any) {
  const styles = useStyle();

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={56} color={C.success50} />
          </View>

          <Text style={styles.title}>{"\u00A1Peso registrado!"}</Text>
          <Text style={styles.subtitle}>70.0 kg guardado</Text>

          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.popToTop()}>
            <Text style={styles.continueBtnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
    checkCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.success5, justifyContent: "center", alignItems: "center", marginBottom: 32, borderWidth: 2, borderColor: C.success50 },
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, textAlign: "center", marginBottom: 12 },
    subtitle: { fontSize: 16, fontFamily: FONT.medium, color: C.gray50, textAlign: "center", marginBottom: 48 },
    continueBtn: { backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 64 },
    continueBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  });
}
