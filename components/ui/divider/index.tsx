'use client';
import React from 'react';
import { View, type ViewProps } from 'react-native';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const dividerStyle = tva({
  base: 'bg-border',
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    },
  },
});

type IDividerProps = ViewProps &
  VariantProps<typeof dividerStyle> & { className?: string };

const Divider = React.forwardRef<React.ComponentRef<typeof View>, IDividerProps>(
  function Divider({ className, orientation = 'horizontal', ...props }, ref) {
    return (
      <View
        className={dividerStyle({ orientation, class: className })}
        {...props}
        ref={ref}
      />
    );
  }
);

Divider.displayName = 'Divider';
export { Divider };
