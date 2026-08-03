import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C } from '../pages/migrated/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface AnimatedRingProps {
  size?: number;
  strokeWidth?: number;
  percent: number;
  color?: string;
  trackColor?: string;
  duration?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function AnimatedRing({
  size = 96,
  strokeWidth = 8,
  percent,
  color = C.orange,
  trackColor = C.gray70,
  duration = 900,
  children,
  style,
}: AnimatedRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    offset.setValue(circumference);
    Animated.timing(offset, {
      toValue: circumference * (1 - Math.min(Math.max(percent, 0), 100) / 100),
      duration,
      useNativeDriver: true,
    }).start();
  }, [percent, circumference, duration, offset]);

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        {children}
      </View>
    </View>
  );
}
