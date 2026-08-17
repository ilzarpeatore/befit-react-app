'use client';
import React from 'react';
import { View, type ViewProps } from 'react-native';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const vstackStyle = tva({
  base: 'flex-col',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-5',
      '2xl': 'gap-6',
    },
    reversed: {
      true: 'flex-col-reverse',
    },
  },
});

type IVStackProps = ViewProps &
  VariantProps<typeof vstackStyle> & { className?: string };

const VStack = React.forwardRef<React.ComponentRef<typeof View>, IVStackProps>(
  function VStack({ className, space, reversed, ...props }, ref) {
    return (
      <View
        className={vstackStyle({ space, reversed, class: className })}
        {...props}
        ref={ref}
      />
    );
  }
);

VStack.displayName = 'VStack';
export { VStack };
