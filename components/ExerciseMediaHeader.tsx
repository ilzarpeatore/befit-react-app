import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../pages/migrated/theme';

export const HEADER_HEIGHT_RATIO = 0.45;

interface Props {
  headerHeight: number;
  thumbnailUrl: string | null;
}

/**
 * Cabecera con media. Es un hijo normal (no animado) del ScrollView, con
 * altura fija — el scroll nativo ya la "colapsa" 1:1 sin remanente al
 * desplazarse por encima de ella, sin ningún cálculo por frame en JS.
 * Una versión anterior animaba `height` vía interpolate() en cada evento
 * de scroll (useNativeDriver:false) para lograr el mismo efecto, pero
 * forzaba un re-layout nativo en cada frame y producía vibración/jank
 * visible al hacer scroll — esta versión es más simple y no tiene ese
 * problema porque no anima nada.
 * Los iconos flotantes van fuera de este componente (posicionados
 * respecto a toda la pantalla, no a la media) para que sigan visibles
 * incluso cuando la media ya se desplazó fuera de la vista.
 */
function ExerciseMediaHeader({ headerHeight, thumbnailUrl }: Props) {
  return (
    <View style={[styles.wrap, { height: headerHeight }]}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Ionicons name="barbell-outline" size={72} color={C.gray30} />
        </View>
      )}
    </View>
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
