import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { SkipButtonInterface } from "./_types/SkipButton.i";
/**
 * unboarding carousel skip button
 * @example
 * <SkipButtonMem activeindex={0} dataLength={1} onLoginPress={()=>{}} onSkipPress={()=>{}} />
 */
function SkipButton({ activeindex, dataLength, onSkipPress, onLoginPress }: SkipButtonInterface) {
    const styles = useStyle();
    /**
     * don't show skip for last slide
     */
    if (activeindex < dataLength - 1)
        return (
            <TouchableOpacity
                style={styles.skipbtn}
                onPress={() => {
                    onSkipPress()
                }}
            >
                <Text style={styles.skipbtntext}>Skip</Text>
            </TouchableOpacity>
        )
    else
        /**
         * show login button for last slide
         */
        return (
            <TouchableOpacity
                style={styles.skipbtn}
                onPress={() => {
                    onLoginPress()
                }}
            >
                <Text style={styles.skipbtntext}>Have an account? Log in</Text>
            </TouchableOpacity>
        )
}
/**
 * return as memo
 */
export const SkipButtonMem = React.memo(SkipButton);
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
    const styles = useResponsiveStyleSheet({
        skipbtn: {
            marginTop: '40@ratio',
            justifyContent: "center",
            alignItems: "center",
        },
        skipbtntext: {
            fontFamily: "Gilroy-Bold",
            fontSize: '16@ratio',
            color: "#6B6B70",
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
    skipbtn: {
        marginTop: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    skipbtntext: {
        fontFamily: "Gilroy-Bold",
        fontSize: 16,
        color: "#8A8CB2",
    },
});
