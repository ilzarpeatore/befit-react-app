import React from 'react';
import { Animated, View, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../pages/migrated/theme';

export const HEADER_HEIGHT_RATIO = 0.45;

interface Props {
  headerHeight: number;
  scrollY: Animated.Value;
  thumbnailUrl: string | null;
  onBack: () => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
}

/**
 * Cabecera con media que colapsa 1:1 con el scroll (de headerHeight a 0).
 * Los iconos flotantes van fuera de este componente (posicionados
 * respecto a toda la pantalla, no a la media) para que sigan visibles
 * incluso cuando la media ya colapsó del todo.
 */
function ExerciseMediaHeader({ headerHeight, scrollY, thumbnailUrl }: Props) {
  const animatedHeight = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [headerHeight, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.wrap, { height: animatedHeight }]}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Ionicons name="barbell-outline" size={72} color={C.gray30} />
        </View>
      )}
    </Animated.View>
  );
}

export const ExerciseMediaHeaderMem = React.memo(ExerciseMediaHeader);

interface FloatingIconsProps {
  onBack: () => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
}

export function ExerciseHeaderFloatingIcons({ onBack, isFavourite, onToggleFavourite }: FloatingIconsProps) {
  return (
    <>
      <TouchableOpacity style={[styles.floatingBtn, styles.backBtn]} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color={C.white} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.floatingBtn, styles.favBtn]} onPress={onToggleFavourite}>
        <Ionicons name={isFavourite ? 'star' : 'star-outline'} size={20} color={C.white} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: C.surfaceLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backBtn: {
    left: 16,
  },
  favBtn: {
    right: 16,
  },
});
