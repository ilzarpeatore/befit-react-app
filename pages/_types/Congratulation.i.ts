import { NavigationProp, RouteProp } from "@react-navigation/native";

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface CongratulationPropsInterface {
    navigation: NavigationProp<NavigationParamList>;
    route: RouteProp<NavigationParamList, string>;
}