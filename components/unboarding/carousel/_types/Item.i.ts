import { ImageSourcePropType } from "react-native";

export interface ItemDataInterface {
    source: ImageSourcePropType,
    sources: {
        2: ImageSourcePropType,
        3: ImageSourcePropType,
        4: ImageSourcePropType,
    },
    titlel: string,
    title: string,
    info: string,
}
export interface ItemPropsInterface {
    item: ItemDataInterface
}