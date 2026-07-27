import { NavigationProp } from "@react-navigation/native";
import { ImageSourcePropType } from "react-native";

export type mapMakerActivityType = "cycling" | "running" | "walking";

export interface mapMakerInterface {
    key: number,
    id: number,
    username: string,
    name: string,
    activity: mapMakerActivityType,
    distance: number | string,
    unit: string,
    latitude: number,
    longitude: number,
    color: {
        start: string,
        stop: string,
    },
    avatar: ImageSourcePropType,
    coordinates: {
        latitude: number,
        longitude: number,
    }[],
    coordinateshighlightcolor: string,
}

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface ClubmapPropsInterface {
    navigation: NavigationProp<NavigationParamList>
}