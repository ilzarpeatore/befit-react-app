import { NavigationProp } from "@react-navigation/native";
import { StyleProp, ViewStyle } from "react-native";

export interface HeightsliderscrollbgInterface {
    styles: {
        [key: string]: StyleProp<ViewStyle>;
    }
}

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface HeightPropsInterface {
    navigation: NavigationProp<NavigationParamList>
}