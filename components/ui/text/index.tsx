'use client';
import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const textStyle = tva({
  base: 'font-gilroy-regular text-foreground',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    },
    weight: {
      light: 'font-gilroy-light',
      regular: 'font-gilroy-regular',
      medium: 'font-gilroy-medium',
      semibold: 'font-gilroy-semibold',
      bold: 'font-gilroy-bold',
      extrabold: 'font-gilroy-extrabold',
      black: 'font-gilroy-black',
    },
    muted: {
      true: 'text-muted-foreground',
    },
  },
});

type ITextProps = TextProps &
  VariantProps<typeof textStyle> & { className?: string };

const Text = React.forwardRef<React.ComponentRef<typeof RNText>, ITextProps>(
  function Text({ className, size = 'md', weight = 'regular', muted, ...props }, ref) {
    return (
      <RNText
        className={textStyle({ size, weight, muted, class: className })}
        {...props}
        ref={ref}
      />
    );
  }
);

Text.displayName = 'Text';
export { Text };
