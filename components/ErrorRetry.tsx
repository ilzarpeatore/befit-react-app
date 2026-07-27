import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  message: string;
  onRetry: () => void;
}

function ErrorRetry({ message, onRetry }: Props) {
  const styles = useStyle();

  return (
    <View style={styles.container}>
      <Ionicons
        name="alert-circle-outline"
        size={64}
        color={Colors.DANGER}
      />
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity activeOpacity={0.85} onPress={onRetry}>
        <LinearGradient
          start={{ x: 0.24, y: -0.09 }}
          end={{ x: 0.5, y: 1 }}
          colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
          style={styles.btn}
        >
          <Text style={styles.btnText}>Retry</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export const ErrorRetryMem = React.memo(ErrorRetry);

function useStyle() {
  return useResponsiveStyleSheet({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: "32@ratio",
      paddingVertical: "48@ratio",
    },
    message: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
      textAlign: "center",
      marginTop: "16@ratio",
      marginBottom: "24@ratio",
      lineHeight: "20@ratio",
    },
    btn: {
      borderRadius: "16@ratio",
      paddingHorizontal: "32@ratio",
      paddingVertical: "14@ratio",
      alignItems: "center",
      justifyContent: "center",
    },
    btnText: {
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
    },
  });
}
