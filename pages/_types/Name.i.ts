import { NavigationProp } from "@react-navigation/native";

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface NamePropsInterface {
    navigation: NavigationProp<NavigationParamList>
}
