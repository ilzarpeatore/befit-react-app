import { NavigationProp } from "@react-navigation/native";
import { ImageSourcePropType } from "react-native";

export interface StoriesItemInterface {
    key: number,
    id: number | string,
    avatar: ImageSourcePropType,
    islive: boolean,
    seen: boolean,
    add: boolean,
};

export interface EventsItemInterface {
    key: number,
    id: number,
    icon: ImageSourcePropType,
    number: string,
    title: string,
    time: string,
    gradientcolors: string[],
    boxdropcolor: string,
};

export interface OnlineMembersItemInterface {
    key: number,
    id: number,
    avatar: ImageSourcePropType
};

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface ClubPropsInterface {
    navigation: NavigationProp<NavigationParamList>
}