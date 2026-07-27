import { Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { LinearGradient } from "expo-linear-gradient";
import { ButtonInterface } from "./_types/Button.i";
/**
 * Button
 * @component 
 * @example
 * <ButtonMem onPress={func} text="{string}" style={style} textstyle={style} />
 * @category uikit
 * @subcategory button
 */
function Button({ children, text, style, textstyle, onPress }: ButtonInterface) {
  const styles = useStyle();
  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={onPress}
    >
      <LinearGradient
        start={{ x: 0.88, y: 1.21 }}
        end={{ x: 0.56, y: 0.5 }}
        colors={["rgba(255,255,255,0.13)", "rgba(255,255,255,0)"]}
        style={[styles.btnborder, style]}
      >
        <LinearGradient
          start={{ x: 0.24, y: -0.09 }}
          end={{ x: 0.5, y: 1 }}
          colors={["#7773FA", "#5652E5"]}
          style={[styles.btnbg, style]}
        >
          {children ? children : <Text style={[styles.btntext, textstyle]}>{text}</Text>}
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
};
/**
 * return as memo
 */
export const ButtonMem = React.memo(Button);
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
  const styles = useResponsiveStyleSheet({
    btn: {
      width: '64@ratio',
      height: '64@ratio',
      borderRadius: '18@ratio',
      marginHorizontal: '11@ratio',
    },
    btnborder: {
      padding: '1@ratio',
      width: '64@ratio',
      height: '64@ratio',
      borderRadius: '18@ratio',
    },
    btnbg: {
      width: '64@ratio',
      height: '64@ratio',
      borderRadius: '18@ratio',
      justifyContent: "center",
      alignItems: "center",
    },
    btntext: {
      fontFamily: "Gilroy-Bold",
      fontSize: '18@ratio',
      color: "#ffffff",
    },
  });
  return styles
}
/**
 * style
 * * you can remove this const
 * * use this style if you don't want to use ratio
 */
const styles_old = StyleSheet.create({
  btn: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginHorizontal: 10,
  },
  btnborder: {
    padding: 1,
    width: 64,
    height: 64,
    borderRadius: 18,
  },
  btnbg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  btntext: {
    fontFamily: "Gilroy-Bold",
    fontSize: 18,
    color: "#ffffff",
  }
});
