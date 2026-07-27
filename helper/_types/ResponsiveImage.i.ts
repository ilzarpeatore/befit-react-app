import { ImageProps } from "react-native";

export interface ResponsiveImageInterface extends ImageProps{
    sources: object,
    preferredPixelRatio?: number,
    renderImageElement?: Function,
}