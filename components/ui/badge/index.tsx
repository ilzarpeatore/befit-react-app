'use client';
import React from 'react';
import { View, Text, type ViewProps, type TextProps } from 'react-native';
import {
  tva,
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils';

const SCOPE = 'BADGE';
const StyledView = withStyleContext(View, SCOPE);

const badgeStyle = tva({
  base: 'flex-row items-center self-start rounded-pill px-2.5 py-1 gap-1',
  variants: {
    action: {
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-destructive',
      info: 'bg-info',
      muted: 'bg-muted',
    },
  },
});

const badgeTextStyle = tva({
  base: 'text-xs font-gilroy-semibold uppercase',
  parentVariants: {
    action: {
      success: 'text-success-foreground',
      warning: 'text-warning-foreground',
      error: 'text-destructive-foreground',
      info: 'text-info-foreground',
      muted: 'text-muted-foreground',
    },
  },
});

type IBadgeProps = ViewProps &
  VariantProps<typeof badgeStyle> & { className?: string };

const Badge = React.forwardRef<React.ElementRef<typeof StyledView>, IBadgeProps>(
  function Badge({ className, action = 'muted', ...props }, ref) {
    return (
      <StyledView
        className={badgeStyle({ action, class: className })}
        context={{ action }}
        {...props}
        ref={ref}
      />
    );
  }
);

type IBadgeTextProps = TextProps &
  VariantProps<typeof badgeTextStyle> & { className?: string };

const BadgeText = React.forwardRef<React.ComponentRef<typeof Text>, IBadgeTextProps>(
  function BadgeText({ className, ...props }, ref) {
    const { action: parentAction } = useStyleContext(SCOPE);
    return (
      <Text
        className={badgeTextStyle({
          parentVariants: { action: parentAction },
          class: className,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';
export { Badge, BadgeText };
