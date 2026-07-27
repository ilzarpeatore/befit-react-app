import { StyleProp, ViewStyle } from "react-native";

export interface ChartboxPropsInterface {
    title: string,
    number: number,
    unit: string,
    chartStyle: StyleProp<ViewStyle>,
    children: React.ReactNode,
    styles: {
        [key: string]: StyleProp<ViewStyle>;
    }
}

export interface ChartrowboxPropsInterface {
    title: string,
    number: number,
    totalnumber: number,
    unit: string,
    children: React.ReactNode,
    buttonText: string,
    onPress: () => void,
    borderStyle?: StyleProp<ViewStyle>,
    styles: {
        [key: string]: StyleProp<ViewStyle>;
    }
}