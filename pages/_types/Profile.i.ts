import { NavigationProp } from "@react-navigation/native";
import { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";

export interface storiesDataInterface {
    id: number,
    image: ImageSourcePropType,
    likes: string,
    playable: boolean,
}

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface ProfilePropsInterface {
    navigation: NavigationProp<NavigationParamList>
}

export interface StatisticblockPropsInterface {
    children:React.ReactNode,
    styles: {
        [key: string]: StyleProp<ViewStyle>;
    }
}