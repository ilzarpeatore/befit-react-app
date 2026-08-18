'use client';
import React from 'react';
import { Icon } from '@components/ui/icon';
import { Pressable } from '@components/ui/pressable';
import { HStack } from '@components/ui/hstack';
import { Text } from '@components/ui/text';

// Re-skin del patrón "form falso" repetido en pages/migrated/home/*_form_screen.tsx
// (View+Text de solo lectura con botones +/- alrededor, no es un TextInput real
// — es una decisión de producto existente, este componente solo cambia el
// aspecto visual, no el comportamiento).
interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

function StepperButton({
  icon,
  onPress,
  disabled,
}: {
  icon: 'remove' | 'add';
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="h-11 w-11 items-center justify-center rounded-pill bg-secondary data-[disabled=true]:opacity-40"
    >
      <Icon name={icon} size={20} className="text-foreground" />
    </Pressable>
  );
}

const Stepper = React.forwardRef<React.ComponentRef<typeof HStack>, StepperProps>(
  function Stepper(
    { value, onChange, step = 1, min = 0, max = Infinity, formatValue, className },
    ref
  ) {
    const canDecrement = value - step >= min;
    const canIncrement = value + step <= max;
    return (
      <HStack
        space="lg"
        className={`items-center justify-center ${className ?? ''}`}
        ref={ref}
      >
        <StepperButton
          icon="remove"
          disabled={!canDecrement}
          onPress={() => onChange(Math.max(min, value - step))}
        />
        <Text size="2xl" weight="bold" className="min-w-16 text-center">
          {formatValue ? formatValue(value) : value}
        </Text>
        <StepperButton
          icon="add"
          disabled={!canIncrement}
          onPress={() => onChange(Math.min(max, value + step))}
        />
      </HStack>
    );
  }
);

Stepper.displayName = 'Stepper';
export { Stepper };
