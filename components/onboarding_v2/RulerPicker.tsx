import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';
import { C, FONT } from '../../pages/migrated/theme';

const TICK_GAP = 14; // px por unidad entera (1 cm / 1 kg)

interface Props {
  min: number;
  max: number;
  value: number; // siempre en la unidad base (cm / kg), redondeo lo hace el padre
  onChange: (value: number) => void;
  decimals: 0 | 1;
}

// Regla horizontal continua (sin "snap" a un tick concreto) -- el valor se
// deriva directamente del desplazamiento del ScrollView, igual que las
// básculas/tallímetros de apps de referencia tipo Lifesum. Siempre opera en
// la unidad base (cm/kg); la conversión a ft/lbs para mostrar es cosa del
// padre (ver onboarding_v2_screen.tsx), así este componente no necesita
// conocer unidades.
//
// El padding lateral (para que el primer/último tick pueda llegar al centro)
// se calcula a partir del ANCHO REAL del propio contenedor (onLayout), no de
// Dimensions.get('window') -- este componente vive dentro de una screen con
// padding horizontal, así que su ancho real es menor que el de la pantalla;
// usar el ancho de pantalla completo desplazaría el marcador central fuera
// del centro visual real de la regla.
export default function RulerPicker({ min, max, value, onChange, decimals }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const didInitialScroll = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let v = Math.floor(min); v <= Math.ceil(max); v++) arr.push(v);
    return arr;
  }, [min, max]);

  const contentWidth = (ticks.length - 1) * TICK_GAP;
  const sidePadding = containerWidth / 2;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const raw = min + offsetX / TICK_GAP;
      const clamped = Math.min(max, Math.max(min, raw));
      const factor = decimals === 1 ? 10 : 1;
      const rounded = Math.round(clamped * factor) / factor;
      onChange(rounded);
    },
    [min, max, decimals, onChange]
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      setContainerWidth(width);
      if (didInitialScroll.current) return;
      didInitialScroll.current = true;
      const x = (value - min) * TICK_GAP;
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ x, animated: false }));
    },
    [value, min]
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={[styles.centerMarker, { left: containerWidth / 2 - 1 }]} pointerEvents="none" />
      {containerWidth > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          contentContainerStyle={{ width: contentWidth + sidePadding * 2, alignItems: 'flex-end' }}
        >
          <View style={{ width: sidePadding }} />
          {ticks.map((tick) => {
            const isMajor = tick % 10 === 0;
            const isMid = !isMajor && tick % 5 === 0;
            return (
              <View key={tick} style={{ width: TICK_GAP, alignItems: 'center' }}>
                <View
                  style={[
                    styles.tick,
                    { height: isMajor ? 40 : isMid ? 28 : 16, backgroundColor: isMajor ? C.textPrimary : C.gray30 },
                  ]}
                />
                {isMajor && <Text style={styles.tickLabel}>{tick}</Text>}
              </View>
            );
          })}
          <View style={{ width: sidePadding }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 76, width: '100%', justifyContent: 'flex-end' },
  centerMarker: {
    position: 'absolute',
    top: 0,
    height: 46,
    width: 2,
    backgroundColor: C.orange,
    zIndex: 2,
  },
  tick: { width: 2, borderRadius: 1 },
  tickLabel: { marginTop: 6, fontSize: 11, fontFamily: FONT.medium, color: C.gray40 },
});
