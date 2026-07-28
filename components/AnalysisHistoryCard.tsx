import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, FONT } from '../pages/migrated/theme';
import { ExerciseAnalysisSession } from '../api/exerciseInfo';

interface Props {
  session: ExerciseAnalysisSession;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AnalysisHistoryCard({ session }: Props) {
  const columns = useMemo(() => {
    const keys = new Set<string>();
    session.sets.forEach((set) => {
      Object.keys(set).forEach((k) => {
        if (k !== 'set_number') keys.add(k);
      });
    });
    return Array.from(keys);
  }, [session.sets]);

  const hasPr = session.prs_this_session && session.prs_this_session.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.date}>{formatDate(session.date)}</Text>
        {session.workout_title ? (
          <Text style={styles.workoutTitle} numberOfLines={1}>
            {session.workout_title}
          </Text>
        ) : null}
        {hasPr ? (
          <View style={styles.prBadge}>
            <Text style={styles.prBadgeText}>PR</Text>
          </View>
        ) : null}
      </View>

      {columns.length > 0 ? (
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.headCell, styles.serieCol]}>#</Text>
            {columns.map((col) => (
              <Text key={col} style={[styles.headCell, styles.metricCol]}>
                {col}
              </Text>
            ))}
          </View>
          {session.sets.map((set, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.cell, styles.serieCol]}>{set.set_number ?? idx + 1}</Text>
              {columns.map((col) => (
                <Text key={col} style={[styles.cell, styles.metricCol]}>
                  {set[col] ?? '-'}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export const AnalysisHistoryCardMem = React.memo(AnalysisHistoryCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surfaceLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.white,
  },
  workoutTitle: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textSecondary,
  },
  prBadge: {
    marginLeft: 8,
    backgroundColor: C.brand50,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  prBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: C.white,
  },
  table: {},
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  headCell: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: C.textSecondary,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  cell: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: C.white,
    textAlign: 'center',
  },
  serieCol: { width: 28, textAlign: 'left' },
  metricCol: { flex: 1 },
});
