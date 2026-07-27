import { AnimatableNumericValue, Animated, ColorValue, CursorValue, DimensionValue, FlexAlignType, ImageStyle, ShadowStyleIOS, TextStyle, TransformsStyle } from "react-native";

export type DimensionValueRatio =
    | number
    | 'auto'
    | `${number}%`
    | `${number}@ratio`
    | `-${number}@ratio`
    | Animated.AnimatedNode
    | null;
export interface FlexStyle {
    alignContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | undefined;
    alignItems?: FlexAlignType | undefined;
    alignSelf?: 'auto' | FlexAlignType | undefined;
    aspectRatio?: number | string | undefined;
    borderBottomWidth?: DimensionValueRatio | undefined;
    borderEndWidth?: DimensionValueRatio | undefined;
    borderLeftWidth?: DimensionValueRatio | undefined;
    borderRightWidth?: DimensionValueRatio | undefined;
    borderStartWidth?: DimensionValueRatio | undefined;
    borderTopWidth?: DimensionValueRatio | undefined;
    borderWidth?: DimensionValueRatio | undefined;
    bottom?: DimensionValueRatio | undefined;
    display?: 'none' | 'flex' | undefined;
    end?: DimensionValue | undefined;
    flex?: number | undefined;
    flexBasis?: DimensionValue | undefined;
    flexDirection?:
    | 'row'
    | 'column'
    | 'row-reverse'
    | 'column-reverse'
    | undefined;
    rowGap?: number | undefined;
    gap?: number | undefined;
    columnGap?: number | undefined;
    flexGrow?: number | undefined;
    flexShrink?: number | undefined;
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse' | undefined;
    height?: DimensionValueRatio | undefined;
    justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | undefined;
    left?: DimensionValueRatio | undefined;
    margin?: DimensionValueRatio | undefined;
    marginBottom?: DimensionValueRatio | undefined;
    marginEnd?: DimensionValueRatio | undefined;
    marginHorizontal?: DimensionValueRatio | undefined;
    marginLeft?: DimensionValueRatio | undefined;
    marginRight?: DimensionValueRatio | undefined;
    marginStart?: DimensionValueRatio | undefined;
    marginTop?: DimensionValueRatio | undefined;
    marginVertical?: DimensionValueRatio | undefined;
    maxHeight?: DimensionValueRatio | undefined;
    maxWidth?: DimensionValueRatio | undefined;
    minHeight?: DimensionValueRatio | undefined;
    minWidth?: DimensionValueRatio | undefined;
    overflow?: 'visible' | 'hidden' | 'scroll' | undefined;
    padding?: DimensionValueRatio | undefined;
    paddingBottom?: DimensionValueRatio | undefined;
    paddingEnd?: DimensionValueRatio | undefined;
    paddingHorizontal?: DimensionValueRatio | undefined;
    paddingLeft?: DimensionValueRatio | undefined;
    paddingRight?: DimensionValueRatio | undefined;
    paddingStart?: DimensionValueRatio | undefined;
    paddingTop?: DimensionValueRatio | undefined;
    paddingVertical?: DimensionValueRatio | undefined;
    position?: 'absolute' | 'relative' | 'static' | undefined;
    right?: DimensionValueRatio | undefined;
    start?: DimensionValueRatio | undefined;
    top?: DimensionValueRatio | undefined;
    width?: DimensionValueRatio | undefined;
    zIndex?: number | undefined;

    /**
     * @platform ios
     */
    direction?: 'inherit' | 'ltr' | 'rtl' | undefined;
}
export interface ViewStyle extends FlexStyle, ShadowStyleIOS, TransformsStyle {
    backfaceVisibility?: 'visible' | 'hidden' | undefined;
    backgroundColor?: ColorValue | undefined;
    borderBlockColor?: ColorValue | undefined;
    borderBlockEndColor?: ColorValue | undefined;
    borderBlockStartColor?: ColorValue | undefined;
    borderBottomColor?: ColorValue | undefined;
    borderBottomEndRadius?: AnimatableNumericValue | undefined;
    borderBottomLeftRadius?: AnimatableNumericValue | undefined;
    borderBottomRightRadius?: AnimatableNumericValue | undefined;
    borderBottomStartRadius?: AnimatableNumericValue | undefined;
    borderColor?: ColorValue | undefined;
    /**
     * On iOS 13+, it is possible to change the corner curve of borders.
     * @platform ios
     */
    borderCurve?: 'circular' | 'continuous' | undefined;
    borderEndColor?: ColorValue | undefined;
    borderEndEndRadius?: DimensionValueRatio | undefined;
    borderEndStartRadius?: DimensionValueRatio | undefined;
    borderLeftColor?: ColorValue | undefined;
    borderRadius?: DimensionValueRatio | undefined;
    borderRightColor?: ColorValue | undefined;
    borderStartColor?: ColorValue | undefined;
    borderStartEndRadius?: DimensionValueRatio | undefined;
    borderStartStartRadius?: DimensionValueRatio | undefined;
    borderStyle?: 'solid' | 'dotted' | 'dashed' | undefined;
    borderTopColor?: ColorValue | undefined;
    borderTopEndRadius?: DimensionValueRatio | undefined;
    borderTopLeftRadius?: DimensionValueRatio | undefined;
    borderTopRightRadius?: DimensionValueRatio | undefined;
    borderTopStartRadius?: DimensionValueRatio | undefined;
    opacity?: AnimatableNumericValue | undefined;
    /**
     * Sets the elevation of a view, using Android's underlying
     * [elevation API](https://developer.android.com/training/material/shadows-clipping.html#Elevation).
     * This adds a drop shadow to the item and affects z-order for overlapping views.
     * Only supported on Android 5.0+, has no effect on earlier versions.
     *
     * @platform android
     */
    elevation?: number | undefined;
    /**
     * Controls whether the View can be the target of touch events.
     */
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto' | undefined;
    cursor?: CursorValue | undefined;
}

export interface RatioStyle {
    paddingTop?: DimensionValueRatio | undefined;
    paddingHorizontal?: DimensionValueRatio | undefined;
    marginBottom?: DimensionValueRatio | undefined;
    width?: DimensionValueRatio | undefined;
    height?: DimensionValueRatio | undefined;
    fontSize?: DimensionValueRatio | undefined;
    marginLeft?: DimensionValueRatio | undefined;
    marginTop?: DimensionValueRatio | undefined;
    left?: DimensionValueRatio | undefined;
    minWidth?: DimensionValueRatio | undefined;
    top?: DimensionValueRatio | undefined;
    padding?: DimensionValueRatio | undefined;
    paddingVertical?: DimensionValueRatio | undefined;
    marginRight?: DimensionValueRatio | undefined;
    paddingLeft?: DimensionValueRatio | undefined;
    lineHeight?: DimensionValueRatio | undefined;
    marginHorizontal?: DimensionValueRatio | undefined;
    bottom?: DimensionValueRatio | undefined;
    paddingBottom?: DimensionValueRatio | undefined;
    borderLeftWidth?: DimensionValueRatio | undefined;
    borderRightWidth?: DimensionValueRatio | undefined;
    borderBottomWidth?: DimensionValueRatio | undefined;
    paddingRight?: DimensionValueRatio | undefined;
    marginVertical?: DimensionValueRatio | undefined;
    minHeight?: DimensionValueRatio | undefined;
    maxWidth?: DimensionValueRatio | undefined;
    borderWidth?: DimensionValueRatio | undefined;
    right?: DimensionValueRatio | undefined;
    borderRadius?: DimensionValueRatio | undefined;
}

export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle | RatioStyle };
