'use client';
import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const headingStyle = tva({
  base: 'font-gilroy-bold text-foreground',
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-3xl',
      '2xl': 'text-4xl',
    },
  },
});

type IHeadingProps = TextProps &
  VariantProps<typeof headingStyle> & { className?: string };

const Heading = React.forwardRef<React.ComponentRef<typeof RNText>, IHeadingProps>(
  function Heading({ className, size = 'lg', ...props }, ref) {
    return (
      <RNText
        className={headingStyle({ size, class: className })}
        {...props}
        ref={ref}
      />
    );
  }
);

Heading.displayName = 'Heading';
export { Heading };
