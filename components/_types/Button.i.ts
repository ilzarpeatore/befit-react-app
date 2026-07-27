import { GestureResponderEvent, StyleProp, TextStyle, ViewStyle } from "react-native";

export interface ButtonInterface {
  children?: React.JSX.Element,
  text?: string,
  style?: StyleProp<ViewStyle>,
  textstyle?: StyleProp<TextStyle>,
  onPress?: (event: GestureResponderEvent) => void
}