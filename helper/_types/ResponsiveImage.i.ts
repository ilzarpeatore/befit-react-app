import { ImageProps } from "expo-image";

export interface ResponsiveImageInterface extends ImageProps{
    sources: object,
    preferredPixelRatio?: number,
    renderImageElement?: Function,
}