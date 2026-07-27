import React, { useState, useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

export default function EmparejandoScreen({ navigation }: any) {
  const styles = useStyle();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const dots = [dot1, dot2, dot3];
    const dotAnimations = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(d, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      )
    );
    dotAnimations.forEach((a) => a.start());

    const timer = setTimeout(() => {
      navigation.replace("DeviceConnected");
    }, 3000);

    return () => {
      pulse.stop();
      dotAnimations.forEach((a) => a.stop());
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Animated.View style={[styles.spinner, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="bluetooth-outline" size={48} color={C.brand50} />
          </Animated.View>

          <Text style={styles.title}>Emparejando...</Text>
          <Text style={styles.subtitle}>Buscando dispositivos cercanos...</Text>

          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
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
    },
    spinner: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: C.brand10,
      borderWidth: 2,
      borderColor: C.brand50,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 22,
      fontFamily: FONT.bold,
      color: C.white,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: FONT.regular,
      color: C.gray5,
      marginBottom: 32,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 12,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: C.brand50,
    },
  });
}
