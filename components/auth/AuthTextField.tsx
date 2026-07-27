import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";

interface Props {
  label: string;
  hint?: string;
  prefixIcon?: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
}

export function AuthTextField({
  label,
  hint,
  prefixIcon,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
  editable = true,
}: Props) {
  const styles = useStyle();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <LinearGradient
        start={{ x: 0.26, y: -1.53 }}
        end={{ x: 0.63, y: 2.9 }}
        colors={[Colors.BORDER_START, Colors.BORDER_END, Colors.BORDER_START]}
        style={styles.border}
      >
        <View style={styles.inputRow}>
          {prefixIcon && (
            <Ionicons
              name={prefixIcon}
              size={20}
              color={Colors.TEXT_SECONDARY}
              style={styles.icon}
            />
          )}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            secureTextEntry={hidden}
            autoCapitalize={autoCapitalize}
            placeholderTextColor={Colors.TEXT_MUTED}
            placeholder={hint}
            editable={editable}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {secureTextEntry && (
            <TouchableOpacity onPress={() => setHidden(!hidden)}>
              <Ionicons
                name={hidden ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={Colors.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    wrapper: {
      marginBottom: "16@ratio",
    },
    label: {
      fontFamily: "Gilroy-Medium",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
      marginBottom: "8@ratio",
      marginLeft: "4@ratio",
    },
    border: {
      borderRadius: "16@ratio",
      padding: "1@ratio",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.BG_INPUT,
      borderRadius: "16@ratio",
      paddingHorizontal: "16@ratio",
      height: "56@ratio",
    },
    icon: {
      marginRight: "10@ratio",
    },
    input: {
      flex: 1,
      fontFamily: "Gilroy-Bold",
      fontSize: "16@ratio",
      color: Colors.TEXT_PRIMARY,
      height: "100%",
    },
  });
}
