import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { C, FONT, SHADOW } from './theme';
import { workoutHistoryApi, CompletedSessionItem } from '../../api/workoutHistory';
import logger from '@helper/logger';

function formatDuration(totalSeconds: number | null): string {
  if (!totalSeconds) return '--';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m} min`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function WorkoutHistoryScreen(props: any) {
  const [sessions, setSessions] = useState<CompletedSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await workoutHistoryApi.getMyCompletedSessions();
      setSessions(res.data?.data ?? []);
    } catch (e) {
      logger.error('WorkoutHistory load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetail = (item: CompletedSessionItem) => {
    props.navigation?.navigate('MigratedSessionHistoryDetail', {
      programDayAssignmentId: item.program_day_assignment_id,
      workoutTemplateId: item.workout_template_id,
      date: item.date.slice(0, 10),
      title: item.title,
    });
  };

  const renderItem = (item: CompletedSessionItem) => (
    <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.75} onPress={() => openDetail(item)}>
      <View style={s.thumbWrap}>
        {item.thumbnail ? (
          <ExpoImage source={{ uri: item.thumbnail }} style={s.thumb} contentFit="cover" />
        ) : (
          <Ionicons name="barbell-outline" size={22} color={C.gray30} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={s.cardDate}>{formatDate(item.date)}</Text>
        <View style={s.metaRow}>
          <Text style={s.metaText}>{formatDuration(item.duration_seconds)}</Text>
          {item.volume_kg != null && <Text style={s.metaText}> · {Math.round(item.volume_kg).toLocaleString('es-ES')} kg</Text>}
          {item.difficulty_label && <Text style={s.metaText}> · {item.difficulty_label}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={C.gray40} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Historial de entrenamientos</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={s.loaderWrap}>
          <ActivityIndicator size="large" color={C.textSecondary} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={s.loaderWrap}>
          <Ionicons name="barbell-outline" size={40} color={C.gray30} />
          <Text style={s.emptyText}>Todavía no has completado ningún entrenamiento</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {sessions.map(renderItem)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontFamily: FONT.bold, color: C.textPrimary },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  emptyText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, padding: 14, marginBottom: 10, ...SHADOW.card },
  thumbWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.gray5, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
  thumb: { width: 48, height: 48 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 14.5, color: C.textPrimary },
  cardDate: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', marginTop: 4 },
  metaText: { fontFamily: FONT.medium, fontSize: 11.5, color: C.gray40 },
});
