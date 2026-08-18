'use client';
import React from 'react';
import { createTooltip } from '@gluestack-ui/core/tooltip/creator';
import { View, Text, ViewStyle } from 'react-native';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { tva , withStyleContext } from '@gluestack-ui/utils/nativewind-utils';

import {
  Motion,
  AnimatePresence,
  MotionComponentProps,
} from '@legendapp/motion';
import { styled } from 'nativewind';
import { GlassView, isGlassEffectAPIAvailable } from '@components/ui/glass-view';

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

const StyledMotionView = styled(MotionView, { className: 'style' });

export const UITooltip = createTooltip({
  Root: withStyleContext(StyledMotionView),
  Content: MotionView,
  Text: Text,
  AnimatePresence: AnimatePresence,
});


const tooltipStyle = tva({
  base: 'w-full h-full web:pointer-events-none',
});

const tooltipContentStyle = tva({
  base: 'py-1 px-3 rounded-sm web:pointer-events-auto',
  variants: {
    // bg-background/90 solo hace falta como fondo de reserva cuando NO hay
    // Liquid Glass real (Android, iOS<26) — con glass real el material
    // translúcido ya lo pinta el GlassView interno.
    hasGlass: {
      true: '',
      false: 'bg-background/90',
    },
  },
});

const tooltipTextStyle = tva({
  base: 'font-normal tracking-normal web:select-none text-xs text-foreground/90',

  variants: {
    isTruncated: {
      true: 'line-clamp-1 truncate',
    },
    bold: {
      true: 'font-bold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    size: {
      '2xs': 'text-2xs',
      'xs': 'text-xs',
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
    sub: {
      true: 'text-xs',
    },
    italic: {
      true: 'italic',
    },
    highlight: {
      true: 'bg-yellow-500',
    },
  },
});

type ITooltipProps = React.ComponentProps<typeof UITooltip> &
  VariantProps<typeof tooltipStyle> & { className?: string };
type ITooltipContentProps = React.ComponentProps<typeof UITooltip.Content> &
  VariantProps<typeof tooltipContentStyle> & { className?: string };
type ITooltipTextProps = React.ComponentProps<typeof UITooltip.Text> &
  VariantProps<typeof tooltipTextStyle> & { className?: string };

const Tooltip = React.forwardRef<
  React.ComponentRef<typeof UITooltip>,
  ITooltipProps
>(function Tooltip({ className, ...props }, ref) {
  return (
    <UITooltip
      ref={ref}
      className={tooltipStyle({ class: className })}
      {...props}
    />
  );
});

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof UITooltip.Content>,
  ITooltipContentProps & { className?: string }
>(function TooltipContent({ className, children, ...props }, ref) {
  // UITooltip.Content (MotionView, de @legendapp/motion) solo anima
  // posición/opacidad — no puede ser en sí mismo el GlassView (motion no
  // sabe envolver un componente nativo custom). Se deja como wrapper
  // transparente y el fondo/padding/radio real vive en el GlassView de
  // dentro — Liquid Glass real en iOS 26+, bg-background/90 de reserva en
  // cualquier otro caso.
  return (
    <UITooltip.Content ref={ref} {...props} pointerEvents="auto">
      <GlassView
        glassEffectStyle="regular"
        className={tooltipContentStyle({
          hasGlass: isGlassEffectAPIAvailable(),
          class: className,
        })}
      >
        {children}
      </GlassView>
    </UITooltip.Content>
  );
});

const TooltipText = React.forwardRef<
  React.ComponentRef<typeof UITooltip.Text>,
  ITooltipTextProps & { className?: string }
>(function TooltipText({ size, className, ...props }, ref) {
  return (
    <UITooltip.Text
      ref={ref}
      className={tooltipTextStyle({ size, class: className })}
      {...props}
    />
  );
});

Tooltip.displayName = 'Tooltip';
TooltipContent.displayName = 'TooltipContent';
TooltipText.displayName = 'TooltipText';

export { Tooltip, TooltipContent, TooltipText };
