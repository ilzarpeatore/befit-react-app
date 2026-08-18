'use client';
import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

type ISpinnerProps = Omit<ActivityIndicatorProps, 'size'> & {
  size?: 'small' | 'large';
};

const Spinner = React.forwardRef<ActivityIndicator, ISpinnerProps>(
  function Spinner({ size = 'small', color = '#000000', ...props }, ref) {
    return <ActivityIndicator ref={ref} size={size} color={color} {...props} />;
  }
);

Spinner.displayName = 'Spinner';
export { Spinner };
