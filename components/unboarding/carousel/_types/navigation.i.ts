import { GestureResponderEvent } from "react-native";

export interface NavigationPropsInterface {
    activeindex: number,
    dataLength: number,
    onNavPress: (button: 'prev' | 'next') => void,
    onRegisterPress: (event: GestureResponderEvent) => void
}