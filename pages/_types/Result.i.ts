import { NavigationProp, RouteProp } from "@react-navigation/native";
import { StyleProp, ViewStyle } from "react-native";

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface ResultPropsInterface {
    navigation: NavigationProp<NavigationParamList>;
    route: RouteProp<NavigationParamList, string>;
}

export interface ResultboxdatalistPropsInterface {
    title: string,
    value: string | number,
    unit: string,
    styles: {
        [key: string]: StyleProp<ViewStyle>;
    }
}