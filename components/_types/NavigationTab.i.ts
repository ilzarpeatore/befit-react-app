import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { ImageSourcePropType } from "react-native";

export interface NavigationTabOptionsInterface extends BottomTabNavigationOptions {
    icon: ImageSourcePropType,
    tabBarVisible: boolean,
}