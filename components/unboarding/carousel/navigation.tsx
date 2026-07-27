import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { ButtonMem } from "../../Button";
import { NavigationPropsInterface } from "./_types/navigation.i";
/**
 * unboarding carousel navigation
 * @example
 * <NavigationMem index={0} dataLength={1} onNavPress={()=>{}} onRegisterPress={()=>{}} />
 */
function Navigation({ activeindex, dataLength, onNavPress, onRegisterPress }: NavigationPropsInterface) {
    const styles = useStyle();
    const buttons = [];
    /**
     * don't show prev button for first and last slide
     */
    if (activeindex > 0 && activeindex < dataLength - 1) {
        buttons.push(
            <ButtonMem key={0} onPress={() => {
                onNavPress('prev')
            }}>
                <Image
                    source={require("@assets/slider/arrowleft.png")}
                    style={styles.btnimg}
                />
            </ButtonMem>
        )
    }
    /**
     * don't show next button for last slide
     */
    if (activeindex < dataLength - 1) {
        buttons.push(
            <ButtonMem key={buttons.length + 1} onPress={() => {
                onNavPress('next')
            }}>
                <Image
                    source={require("@assets/slider/arrowright.png")}
                    style={styles.btnimg}
                />
            </ButtonMem>
        )
    }
    /**
     * show register button only for last slide
     */
    if (activeindex == dataLength - 1) {
        buttons.push(<ButtonMem key={buttons.length + 1} onPress={onRegisterPress} text="Register" style={styles.btnregister} />)
    }
    /**
     * navigation and buttons
     */
    return (
        <View style={styles.navigation}>
            {buttons}
        </View>
    )
}
/**
 * return as memo
 */
export const NavigationMem = React.memo(Navigation);
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
    const styles = useResponsiveStyleSheet({
        btnimg: {
            width: '40@ratio',
            height: '40@ratio',
        },
        navigation: {
            flexDirection: "row",
            justifyContent: "center",
            marginTop: '55@ratio',
        },
        btnregister: {
            width: '182@ratio',
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
    btnimg: {
        width: 40,
        height: 40,
    },
    navigation: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 55,
    },
    btnregister: {
        width: 182,
    },
});
