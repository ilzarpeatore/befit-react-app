import { NavigationProp } from "@react-navigation/native";
import { ImageSourcePropType, ImageStyle, StyleProp, ViewStyle } from "react-native";

export interface ActivityboxPropsInterface {
    cover: ImageSourcePropType,
    bg: ImageSourcePropType,
    icon: ImageSourcePropType,
    title: string,
    coverstyle?: StyleProp<ImageStyle>,
    iconwidth: number,
    datatype: number,
    datacurrent: number,
    datatotal?: number,
    datalabel?: string,
    datacurrentdec?: number,
    dataunit?: string,
    onPress: () => void,
    styles: {
        [key: string]: StyleProp<any>;
    }
}

export interface MenuItemInterface {
    id: number,
    title: string,
    icon: ImageSourcePropType,
    switch: boolean,
    switchstate: boolean
}

export interface SliderItemInterface {
    key: number,
    image: ImageSourcePropType,
    mask: ImageSourcePropType,
    lableline1: string,
    lableline2: string,
    coverleft: boolean,
}

export interface SliderTabItemInterface {
    key: number,
    value: string,
    sliderkey: number,
    width: number
}

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface HomePropsInterface {
    navigation: NavigationProp<NavigationParamList>
}
