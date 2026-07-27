import { NavigationProp } from "@react-navigation/native";
import { ImageSourcePropType } from "react-native";

export interface storiesItemInterface {
    id: number,
    username: string,
    time: string,
    avatar: ImageSourcePropType,
    location: string,
    likes: string,
    image: ImageSourcePropType,
}

export interface storiesSliderPropsInterface {
    item: storiesItemInterface
}

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface StoriesPropsInterface {
    navigation: NavigationProp<NavigationParamList>
}