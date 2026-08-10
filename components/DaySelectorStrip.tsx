import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C, FONT } from '../pages/migrated/theme';

export interface DaySelectorItem {
  /** YYYY-MM-DD */
  date: string;
  dayLetter: string;
  dayNumber: string;
}

const SPANISH_DAY_LETTERS = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S']; // getDay(): 0=domingo..6=sabado

/**
 * Formatea a YYYY-MM-DD usando el calendario LOCAL del dispositivo — nunca
 * `.toISOString()`, que convierte a UTC: tras un `setHours(0,0,0,0)` local,
 * en cualquier huso con offset positivo (ej. España, UTC+1/+2) la medianoche
 * local cae en la tarde/noche del día UTC anterior, así que
 * `toISOString().slice(0,10)` devolvía sistemáticamente el día de ayer.
 */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Construye los DaySelectorItem para los `count` días terminando en `endDate` (o hoy). */
export function buildDayRange(count: number, endDate?: Date): DaySelectorItem[] {
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(0, 0, 0, 0);
  const items: DaySelectorItem[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    items.push({
      date: toLocalISODate(d),
      dayLetter: SPANISH_DAY_LETTERS[d.getDay()],
      dayNumber: String(d.getDate()),
    });
  }
  return items;
}

/** Construye los 7 DaySelectorItem (lunes-domingo) de la semana que contiene `anyDateInWeek`. */
export function buildWeekRange(anyDateInWeek: Date): DaySelectorItem[] {
  const d = new Date(anyDateInWeek);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=domingo
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  return buildDayRange(7, new Date(monday.getTime() + 6 * 86400000));
}

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
