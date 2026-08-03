import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../pages/migrated/theme';

export interface AppIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  bg?: string;
  containerSize?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function AppIcon({
  name,
  size = 18,
  color = C.textPrimary,
  bg = C.brand10,
  containerSize = 36,
  borderRadius,
  style,
}: AppIconProps) {
  return (
    <View
      style={[
        {
          width: containerSize,
          height: containerSize,
          borderRadius: borderRadius ?? containerSize / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}
