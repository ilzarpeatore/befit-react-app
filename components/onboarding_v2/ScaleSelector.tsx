import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { C, FONT } from '../../pages/migrated/theme';

interface Props {
  min: number;
  max: number;
  value: number | undefined;
  onChange: (value: number) => void;
}

// Fila de números 1-N, tap para elegir -- mismo patrón visual que ChoiceRow
// en checkin_fill_screen.tsx (escala de check-ins diarios).
export default function ScaleSelector({ min, max, value, onChange }: Props) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={styles.row}>
      {values.map((n) => {
        const active = value === n;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  itemActive: { backgroundColor: C.accentBlack, borderColor: C.accentBlack },
  label: { fontSize: 15, fontFamily: FONT.bold, color: C.textPrimary },
  labelActive: { color: '#FFFFFF' },
});
