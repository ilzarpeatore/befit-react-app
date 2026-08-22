import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';
import { C, FONT } from '../../pages/migrated/theme';

const ITEM_WIDTH = 64;

interface Props {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

// Rueda horizontal de números discretos (edad, días/semana, meses
// entrenando, comidas/día) -- a diferencia de RulerPicker, aquí sí "encaja"
// (snapToInterval) en un valor concreto, porque no tiene sentido un valor
// intermedio entre dos enteros para estas preguntas.
//
// El padding lateral se calcula a partir del ancho REAL del contenedor
// (onLayout), igual que en RulerPicker -- ver el comentario de ese archivo.
export default function NumberWheelPicker({ min, max, step = 1, value, onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const didInitialScroll = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [liveIndex, setLiveIndex] = useState<number | null>(null);

  const values = useMemo(() => {
    const arr: number[] = [];
    for (let v = min; v <= max; v += step) arr.push(v);
    return arr;
  }, [min, max, step]);

  const sidePadding = containerWidth / 2 - ITEM_WIDTH / 2;

  // Actualiza qué número se ve "grande" en tiempo real mientras se arrastra
  // (sin esto, el número central solo cambiaría de tamaño al soltar el
  // dedo, y el efecto de rueda se sentiría con retraso).
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
      setLiveIndex(Math.min(values.length - 1, Math.max(0, index)));
    },
    [values.length]
  );

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
      const clampedIndex = Math.min(values.length - 1, Math.max(0, index));
      onChange(values[clampedIndex]);
    },
    [values, onChange]
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      setContainerWidth(e.nativeEvent.layout.width);
      if (didInitialScroll.current) return;
      didInitialScroll.current = true;
      const index = Math.max(0, values.indexOf(value));
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ x: index * ITEM_WIDTH, animated: false }));
    },
    [value, values]
  );

  const selectedIndex = liveIndex ?? values.indexOf(value);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {containerWidth > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={32}
          onMomentumScrollEnd={handleMomentumEnd}
          contentContainerStyle={{ paddingHorizontal: sidePadding }}
        >
          {values.map((v, i) => (
            <View key={v} style={{ width: ITEM_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[styles.item, i === selectedIndex && styles.itemSelected]}>{v}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 64, width: '100%' },
  item: { fontSize: 22, fontFamily: FONT.medium, color: C.gray30 },
  itemSelected: { fontSize: 34, fontFamily: FONT.bold, color: C.textPrimary },
});
