import { Animated, KeyboardTypeOptions, NativeSyntheticEvent, StyleProp, TextInput, TextInputChangeEventData, TextInputProps, TextStyle, ViewStyle } from "react-native";

export interface InputInterface extends TextInputProps {
    name: string,
    label: string,
    inputLabelBgStyle?: Animated.WithAnimatedObject<ViewStyle>,
    inputstyle?: StyleProp<TextStyle>,
    style?: StyleProp<ViewStyle>,
    maxLength?: number,
    keyboardType?: KeyboardTypeOptions,
    onChange?: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void,
}