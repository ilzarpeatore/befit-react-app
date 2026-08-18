'use client';
import { createInput } from '@gluestack-ui/core/input/creator';
import { UIIcon } from '@gluestack-ui/core/icon/creator';
import {
  tva,
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils';
import { styled } from 'nativewind';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

const SCOPE = 'INPUT';
const Root = withStyleContext(View, SCOPE);
const StyledUIIcon = styled(UIIcon, { className: 'style' });

const UIInput = createInput({
  Root: Root,
  Icon: StyledUIIcon,
  Slot: Pressable,
  Input: TextInput,
});

const inputStyle = tva({
  base: 'flex-row items-center rounded-md border border-border bg-card data-[focus=true]:border-ring data-[invalid=true]:border-destructive data-[disabled=true]:opacity-40',
  variants: {
    size: {
      sm: 'h-9',
      md: 'h-11',
      lg: 'h-12',
    },
  },
});

const inputFieldStyle = tva({
  base: 'flex-1 font-gilroy-regular text-foreground px-3 web:outline-none',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});

type IInputProps = React.ComponentPropsWithoutRef<typeof UIInput> &
  VariantProps<typeof inputStyle> & { className?: string };

const Input = React.forwardRef<React.ComponentRef<typeof UIInput>, IInputProps>(
  function Input({ className, size = 'md', ...props }, ref) {
    return (
      <UIInput
        className={inputStyle({ size, class: className })}
        context={{ size }}
        {...props}
        ref={ref}
      />
    );
  }
);

type IInputFieldProps = React.ComponentPropsWithoutRef<typeof UIInput.Input> & {
  className?: string;
};

const InputField = React.forwardRef<
  React.ComponentRef<typeof UIInput.Input>,
  IInputFieldProps
>(function InputField({ className, ...props }, ref) {
  const { size: parentSize } = useStyleContext(SCOPE);
  return (
    <UIInput.Input
      className={inputFieldStyle({ parentVariants: { size: parentSize }, class: className })}
      placeholderTextColor="rgb(var(--muted-foreground))"
      {...props}
      ref={ref}
    />
  );
});

const InputIcon = React.forwardRef<
  React.ComponentRef<typeof UIInput.Icon>,
  React.ComponentPropsWithoutRef<typeof UIInput.Icon> & { className?: string }
>(function InputIcon({ className, ...props }, ref) {
  return (
    <UIInput.Icon
      className={`text-muted-foreground ${className ?? ''}`}
      {...props}
      ref={ref}
    />
  );
});

const InputSlot = UIInput.Slot;

Input.displayName = 'Input';
InputField.displayName = 'InputField';
InputIcon.displayName = 'InputIcon';
export { Input, InputField, InputIcon, InputSlot };
