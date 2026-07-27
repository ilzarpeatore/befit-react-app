import { NavigationProp } from "@react-navigation/native";
import { StyleProp, ViewStyle } from "react-native";

export interface ResultboxdatalistInterface {
    title:string,
    value:string|number,
    unit:string,
    styles: {
        [key: string]: StyleProp<ViewStyle>;
    }
}

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface CyclingPropsInterface {
    navigation: NavigationProp<NavigationParamList>
}