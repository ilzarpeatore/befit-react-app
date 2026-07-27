import { NavigationProp } from "@react-navigation/native";

export type NavigationParamList = {
    [key: string]: { screen: string } | undefined;
};

export interface WeightPropsInterface {
    navigation: NavigationProp<NavigationParamList>
}