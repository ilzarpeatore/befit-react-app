import React, { useRef } from 'react';
import { PixelRatio } from 'react-native';
import { Image } from 'expo-image';
import { ResponsiveImageInterface } from './_types/ResponsiveImage.i';
/**
 * https://github.com/expo/react-native-responsive-image
 * had to make some changes
 * @component
 */
function getClosestHighQualitySource(sources: Record<string, any>, preferredPixelRatio: number) {
  let pixelRatios = Object.keys(sources);
  if (!pixelRatios.length) {
    return null;
  }
  let pixelRatiosNum = pixelRatios.map((ratio) => parseFloat(ratio));
  pixelRatiosNum.sort((ratioA, ratioB) => ratioA - ratioB);
  for (let ii = 0; ii < pixelRatios.length; ii++) {
    if (pixelRatiosNum[ii] >= preferredPixelRatio) {
      return sources[pixelRatios[ii]];
    }
  }

  let largestPixelRatio = pixelRatios[pixelRatios.length - 1];
  return sources[largestPixelRatio];
}

export default function ResponsiveImage({ source, sources, preferredPixelRatio = PixelRatio.get(), renderImageElement, ...rest }: ResponsiveImageInterface) {
  const _image = useRef<React.ElementRef<typeof Image>>(null);

  const optimalSource = getClosestHighQualitySource(sources as Record<string, any>, preferredPixelRatio);
  if (optimalSource) {
    source = optimalSource;
  }
  if (!source) {
    throw new Error(`Couldn't find an appropriate image source`);
  }
  if (renderImageElement) {
    let image = renderImageElement({ ...rest, source });
    return React.cloneElement(image as React.ReactElement<any>, {
      ref: (component: any) => {
        _image.current = component;
      },
    });
  }

  return (
    <Image
      {...rest}
      ref={(component) => {
        _image.current = component;
      }}
      source={source}
    />
  );
}
