import { NavigationProp } from "@react-navigation/native";
import { ImageSourcePropType } from "react-native";

export interface ChallengesItemsInterface {
    key: number,
    id: number,
    icon: ImageSourcePropType,
    title: string,
    time: number | string,
}

export interface MissionsItemsInterface {
    key: number, 
    id: number, 
    image: ImageSourcePropType, 
    title: string, 
    category: string, 
    percentage: number, 
}

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface ChallengesPropsInterface {
    navigation: NavigationProp<NavigationParamList>
}