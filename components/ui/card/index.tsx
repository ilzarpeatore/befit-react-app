'use client';
import React from 'react';
import { View, type ViewProps } from 'react-native';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';

// Una sola capa de fondo por variante — a propósito, para que envolver en
// GlassView (expo-glass-effect) más adelante sea un cambio puntual aquí,
// no en cada pantalla. Reemplaza el patrón repetido a mano en
// pages/migrated/* (bg + border + radius + padding en cada StyleSheet).
const cardStyle = tva({
  base: 'rounded-md bg-card p-card-padding',
  variants: {
    variant: {
      outline: 'border border-border',
      elevated: 'shadow-card',
      filled: 'bg-secondary',
      ghost: '',
    },
  },
});

type ICardProps = ViewProps &
  VariantProps<typeof cardStyle> & { className?: string };

const Card = React.forwardRef<React.ComponentRef<typeof View>, ICardProps>(
  function Card({ className, variant = 'outline', ...props }, ref) {
    return (
      <View
        className={cardStyle({ variant, class: className })}
        {...props}
        ref={ref}
      />
    );
  }
);

Card.displayName = 'Card';
export { Card };
