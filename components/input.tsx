import React, { forwardRef, startTransition, useRef } from "react";
import {
    View,
    TextInput,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { InputInterface } from "./_types/Input.i";
/* create LinearGradient AnimatedComponent for input label animation */
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
/**
 * input
 * @example
 * <Input ref={ref} name="{string}" label="{string}" style={style} inputstyle={style} inputLabelBgStyle={style} ...textinputprops/>
 */
export const Input = forwardRef(({ name, label, style, inputLabelBgStyle, inputstyle, ...props }: InputInterface, ref: React.ForwardedRef<TextInput>) => {
    const styles = useStyle();
    const translateY = useRef(new Animated.Value(30)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const focusAnimation = () => {
        startTransition(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(scale, {
                    toValue: 0.87,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        })
    }
    return (
        <View
            key={name + "_input"}
            style={style}
        >
            {/*TextInput start*/}
            <LinearGradient
                start={{ x: 0.26, y: -1.53 }}
                end={{ x: 0.63, y: 2.9 }}
                colors={[
                    "rgba(138,140,178,1)",
                    "rgba(138,140,178,0)",
                    "rgba(138,140,178,0.6)",
                ]}
                style={styles.inputborder}
            >
                <TextInput
                    key={name}
                    ref={ref}
                    style={[styles.textinput, inputstyle]}
                    onFocus={() => focusAnimation()}
                    {...props}
                />
            </LinearGradient>
            {/*TextInput end*/}
            {/*input label start*/}
            <AnimatedLinearGradient
                start={{ x: 0.26, y: -1.53 }}
                end={{ x: 0.63, y: 2.9 }}
                colors={[
                    "rgba(138,140,178,1)",
                    "rgba(138,140,178,0)",
                    "rgba(138,140,178,0.6)",
                ]}
                style={[
                    styles.inputlabelbg,
                    inputLabelBgStyle,
                    {
                        transform: [{ translateY }],
                        padding: translateY.interpolate({
                            inputRange: [0, 30],
                            outputRange: [styles.inputborder.padding, 0],
                        })

                    },
                ]}
                pointerEvents="none"
            >
                <View style={styles.inputlabelview}>
                    <Animated.Text
                        style={[styles.inputlabel,
                        {
                            fontSize: translateY.interpolate({
                                inputRange: [0, 30],
                                outputRange: [styles.inputlabelres.fontSize, styles.inputlabel.fontSize],
                            })
                        }]}
                    >
                        {label}
                    </Animated.Text>
                </View>
            </AnimatedLinearGradient>
            {/*input label end*/}
        </View>
    );
});
/**
 * style
 * * note : stylesheet is converted to responsiveStyleSheet because we need to use responsive ratio . if you don't want to use resposive ratio you can use the normal stylesheet version
 */
function useStyle() {
    const styles = useResponsiveStyleSheet({
        textinputbox: {
            flex: 1,
            marginTop: '42@ratio',
            paddingHorizontal: '38@ratio',
        },
        inputborder: {
            height: '61@ratio',
            borderRadius: '16@ratio',
            padding: '1@ratio',
        },
        textinput: {
            width: "100%",
            height: "100%",
            backgroundColor: "#141227",
            borderRadius: '16@ratio',
            fontFamily: "Gilroy-Bold",
            fontSize: '18@ratio',
            paddingHorizontal: '12@ratio',
            paddingLeft: '19@ratio',
            color: "#ffffff",
        },
        inputlabelbg: {
            borderRadius: '16@ratio',
            position: "absolute",
            top: '-14@ratio',
            left: '19@ratio',
            justifyContent: 'center'
        },
        inputlabelview: {
            backgroundColor: "#141227",
            borderRadius: '16@ratio',
            paddingVertical: '2@ratio',
            paddingHorizontal: '8@ratio',
        },
        inputlabel: {
            fontFamily: "Gilroy-Bold",
            fontSize: '16@ratio',
            color: "#8A8CB2",
            lineHeight: '19@ratio',
            textAlign: "center",
        },
        inputlabelres: {
            fontSize: '14@ratio',
        },
        inputlabelrowitem: {
            flexBasis: "30.5%",
            marginHorizontal: "1.25%",
        },
        textinputrow: {
            textAlign: "center",
        },
    });
    return styles
}