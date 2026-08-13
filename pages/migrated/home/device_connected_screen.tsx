import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

export default function DeviceConnectedScreen({ navigation, route }: any) {
  const styles = useStyle();
  const isHealthSource = route?.params?.source === 'health';

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={56} color={C.success50} />
          </View>

          <Text style={styles.title}>{"\u00A1Conectado!"}</Text>
          <Text style={styles.subtitle}>
            {isHealthSource
              ? "Tus datos de salud ya se est\u00E1n sincronizando."
              : "Tu wearable est\u00E1 sincronizado correctamente."}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Home', { screen: 'HomePage' })}
          >
            <Text style={styles.buttonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    checkCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: C.success5,
      borderWidth: 2,
      borderColor: C.success50,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontFamily: FONT.bold,
      color: C.white,
      textAlign: "center",
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: FONT.regular,
      color: C.gray50,
      textAlign: "center",
      marginBottom: 48,
    },
    button: {
      backgroundColor: C.brand50,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 48,
    },
    buttonText: {
      fontSize: 16,
      fontFamily: FONT.semiBold,
      color: C.white,
    },
  });
}
