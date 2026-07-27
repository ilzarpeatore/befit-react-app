import { NavigationProp } from "@react-navigation/native";

export type LoginNavigationParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Unboarding: undefined;
};

export interface LoginPropsInterface {
  navigation: NavigationProp<LoginNavigationParamList>;
}
