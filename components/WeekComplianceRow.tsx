import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, FONT } from '../pages/migrated/theme';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// HabitLogLike/computeWeekCompliance viven en ./weekCompliance.ts (no en este
// archivo) para que este módulo solo exporte el componente y así Fast Refresh
// pueda preservar su estado.

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
