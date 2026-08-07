import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { C, FONT, SHADOW } from './theme';
import { workoutHistoryApi, SessionDetail } from '../../api/workoutHistory';
import logger from '@helper/logger';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SessionHistoryDetailScreen(props: any) {
  const { programDayAssignmentId, workoutTemplateId, date, title } = props.route?.params ?? {};
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await workoutHistoryApi.getMySessionDetail({
        program_day_assignment_id: programDayAssignmentId ?? undefined,
        workout_template_id: workoutTemplateId ?? undefined,
        date: workoutTemplateId ? date : undefined,
      });
      setDetail(res.data?.data ?? null);
    } catch (e) {
      logger.error('SessionHistoryDetail load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{title ?? detail?.title ?? 'Entrenamiento'}</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={s.loaderWrap}>
          <ActivityIndicator size="large" color={C.textSecondary} />
        </View>
      ) : !detail ? (
        <View style={s.loaderWrap}>
          <Ionicons name="alert-circle-outline" size={36} color={C.gray30} />
          <Text style={s.emptyText}>No se pudo cargar este entrenamiento</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.dateText}>{formatDate(detail.date)}</Text>

          <View style={s.summaryRow}>
            <View style={s.summaryTile}>
              <Text style={s.summaryValue}>{detail.total_sets}</Text>
              <Text style={s.summaryLabel}>series</Text>
            </View>
            <View style={s.summaryTile}>
              <Text style={s.summaryValue}>{Math.round(detail.total_volume).toLocaleString('es-ES')}</Text>
              <Text style={s.summaryLabel}>kg volumen</Text>
            </View>
            <View style={s.summaryTile}>
              <Text style={s.summaryValue}>{detail.total_reps}</Text>
              <Text style={s.summaryLabel}>reps</Text>
            </View>
            {detail.total_prs > 0 && (
              <View style={s.summaryTile}>
                <Text style={[s.summaryValue, { color: C.orange }]}>{detail.total_prs}</Text>
                <Text style={s.summaryLabel}>PRs</Text>
              </View>
            )}
          </View>

          {(detail.difficulty_label || detail.comment) && (
            <View style={s.feedbackCard}>
              {detail.difficulty_label && (
                <View style={s.feedbackRow}>
                  <Ionicons name="happy-outline" size={16} color={C.textSecondary} />
                  <Text style={s.feedbackText}>Sensación: {detail.difficulty_label}</Text>
                </View>
              )}
              {detail.comment && <Text style={s.commentText}>"{detail.comment}"</Text>}
            </View>
          )}

          {detail.blocks.map((block) => (
            <View key={block.block_id} style={s.blockSection}>
              <Text style={s.blockTitle}>{block.title}</Text>
              {block.exercises.map((ex) => (
                <View key={ex.workout_template_exercise_id} style={s.exerciseCard}>
                  <View style={s.exerciseHeader}>
                    {ex.exercise_image ? (
                      <ExpoImage source={{ uri: ex.exercise_image }} style={s.exerciseImage} contentFit="cover" />
                    ) : (
                      <View style={[s.exerciseImage, s.exerciseImagePlaceholder]}>
                        <Ionicons name="barbell-outline" size={18} color={C.gray30} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.exerciseTitle} numberOfLines={1}>{ex.title ?? 'Ejercicio'}</Text>
                      {!ex.logged && <Text style={s.notLoggedText}>Sin series registradas</Text>}
                      {ex.prs_this_session ? (
                        <View style={s.prBadge}>
                          <Ionicons name="trophy" size={11} color="#FFFFFF" />
                          <Text style={s.prBadgeText}>PR</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  {ex.logged && ex.sets.length > 0 && (
                    <View style={s.setsTable}>
                      <View style={s.setsHeaderRow}>
                        <Text style={[s.setsHeaderText, { flex: 0.6 }]}>Serie</Text>
                        <Text style={[s.setsHeaderText, { flex: 1 }]}>Peso</Text>
                        <Text style={[s.setsHeaderText, { flex: 1 }]}>Reps</Text>
                        <Text style={[s.setsHeaderText, { flex: 1 }]}>RIR/RPE</Text>
                      </View>
                      {ex.sets.map((set) => (
                        <View key={set.set} style={s.setsRow}>
                          <Text style={[s.setsCell, { flex: 0.6 }]}>{set.set}</Text>
                          <Text style={[s.setsCell, { flex: 1 }]}>{set.weight} kg</Text>
                          <Text style={[s.setsCell, { flex: 1 }]}>{set.reps}</Text>
                          <Text style={[s.setsCell, { flex: 1 }]}>{set.rpe_rir ?? '--'}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT.bold, color: C.textPrimary },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  emptyText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  dateText: { fontFamily: FONT.medium, fontSize: 12.5, color: C.textSecondary, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  summaryTile: { flex: 1, backgroundColor: C.surface, borderRadius: 14, paddingVertical: 12, alignItems: 'center', ...SHADOW.card },
  summaryValue: { fontFamily: FONT.bold, fontSize: 18, color: C.textPrimary },
  summaryLabel: { fontFamily: FONT.regular, fontSize: 10.5, color: C.textSecondary, marginTop: 2 },
  feedbackCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 16, ...SHADOW.card },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedbackText: { fontFamily: FONT.medium, fontSize: 13, color: C.textPrimary },
  commentText: { fontFamily: FONT.regular, fontSize: 12.5, color: C.textSecondary, marginTop: 6, fontStyle: 'italic' },
  blockSection: { marginBottom: 16 },
  blockTitle: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  exerciseCard: { backgroundColor: C.surface, borderRadius: 14, padding: 12, marginBottom: 8, ...SHADOW.card },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center' },
  exerciseImage: { width: 40, height: 40, borderRadius: 10, marginRight: 10 },
  exerciseImagePlaceholder: { backgroundColor: C.gray5, alignItems: 'center', justifyContent: 'center' },
  exerciseTitle: { fontFamily: FONT.bold, fontSize: 13.5, color: C.textPrimary },
  notLoggedText: { fontFamily: FONT.regular, fontSize: 11.5, color: C.textSecondary, marginTop: 2 },
  prBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 3, backgroundColor: C.orange, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  prBadgeText: { fontFamily: FONT.bold, fontSize: 10, color: '#FFFFFF' },
  setsTable: { marginTop: 10 },
  setsHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 6, marginBottom: 4 },
  setsHeaderText: { fontFamily: FONT.semiBold, fontSize: 10.5, color: C.gray40, textTransform: 'uppercase' },
  setsRow: { flexDirection: 'row', paddingVertical: 4 },
  setsCell: { fontFamily: FONT.medium, fontSize: 12.5, color: C.textPrimary },
});
