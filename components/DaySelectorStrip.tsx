import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C, FONT } from '../pages/migrated/theme';

export interface DaySelectorItem {
  /** YYYY-MM-DD */
  date: string;
  dayLetter: string;
  dayNumber: string;
}

// toLocalISODate/buildDayRange/buildWeekRange viven en ./dayRange.ts (no en este
// archivo) para que este módulo solo exporte el componente y así Fast Refresh
// pueda preservar su estado.

interface DaySelectorStripProps {
  days: DaySelectorItem[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

export default function DaySelectorStrip({ days, selectedDate, onSelect }: DaySelectorStripProps) {
  return (
    <View style={s.row}>
      {days.map((d) => {
        const isSelected = d.date === selectedDate;
        return (
          <TouchableOpacity key={d.date} style={s.item} activeOpacity={0.75} onPress={() => onSelect(d.date)}>
            <Text style={s.letter}>{d.dayLetter}</Text>
            {isSelected ? (
              <View style={s.selectedCircle}>
                <Text style={s.selectedNumber}>{d.dayNumber}</Text>
              </View>
            ) : (
              <View style={s.card}>
                <Text style={s.number}>{d.dayNumber}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  item: { alignItems: 'center', width: 44 },
  letter: { fontFamily: FONT.medium, fontSize: 12, color: C.textSecondary, marginBottom: 6 },
  card: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontFamily: FONT.bold, fontSize: 15, color: C.textPrimary },
  selectedCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.accentBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedNumber: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF' },
});
