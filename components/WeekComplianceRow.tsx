import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, FONT } from '../pages/migrated/theme';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export interface HabitLogLike {
  date: string;
  is_completed: boolean;
}

/** 7 booleanos (Lunes..Domingo de la semana en curso) a partir de un array de logs con fecha + is_completed. */
export function computeWeekCompliance(logs: HabitLogLike[]): boolean[] {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));

  const completedDates = new Set(
    logs.filter((l) => l.is_completed).map((l) => l.date.slice(0, 10))
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return completedDates.has(d.toISOString().slice(0, 10));
  });
}

interface Props {
  /** 7 booleanos, Lunes a Domingo de la semana actual. */
  completedDays: boolean[];
  color?: string;
  size?: number;
}

/** Fila de 7 recuadros de cumplimiento semanal (L M X J V S D) — mismo estilo (recuadro
 * redondeado, no círculo) en Actividad Semanal, Hábitos y MigratedHabitDetail. */
export default function WeekComplianceRow({ completedDays, color = C.orange, size = 28 }: Props) {
  // Mismo cálculo de radio que DayCell en habit_detail_screen.tsx — recuadro
  // redondeado, no círculo, para que las 3 pantallas se vean idénticas.
  const radius = size >= 24 ? size * 0.28 : 4;
  return (
    <View style={styles.row}>
      {DAY_LABELS.map((label, i) => {
        const done = !!completedDays[i];
        return (
          <View key={label} style={styles.day}>
            <Text style={styles.label}>{label}</Text>
            <View
              style={[
                styles.dot,
                { width: size, height: size, borderRadius: radius },
                done && { backgroundColor: color, borderColor: color },
              ]}
            >
              {done && <Text style={styles.check}>✓</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center' },
  label: { fontSize: 10, color: C.textSecondary, marginBottom: 4, fontFamily: FONT.regular },
  dot: { borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  check: { fontSize: 12, color: '#FFFFFF' },
});
