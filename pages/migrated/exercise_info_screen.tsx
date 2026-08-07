import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { ExerciseMediaHeaderMem, ExerciseHeaderFloatingIcons, HEADER_HEIGHT_RATIO } from '../../components/ExerciseMediaHeader';
import { AnalysisHistoryCardMem } from '../../components/AnalysisHistoryCard';
import { ErrorRetryMem } from '../../components/ErrorRetry';
import MetricLineChart from '../../components/MetricLineChart';
import {
  exerciseInfoApi,
  ExerciseDetailData,
  ExerciseAnalysisData,
  ExerciseAnalysisSession,
} from '../../api/exerciseInfo';

// Claves de logged_sets que no son metricas numericas graficables, mas
// "descanso" (excluida a peticion: no aporta como indicador de progreso).
const EXCLUDED_METRIC_KEYS = ['set_number', 'tempo', 'descanso'];

// "series" no es una clave dentro de cada set (cada elemento de logged_sets
// YA es una serie) — es el numero de series de la sesion, sacado aparte con
// session.sets.length en vez de bestValueForMetric().
const SERIES_METRIC_KEY = 'series';

const METRIC_META: Record<string, { label: string; unit: string; color: string }> = {
  series: { label: 'Series', unit: '', color: C.gray50 },
  carga: { label: 'Carga', unit: 'kg', color: C.orange },
  reps: { label: 'Repeticiones', unit: '', color: C.blue60 },
  rir: { label: 'RIR', unit: '', color: C.purple60 },
  rpe: { label: 'RPE', unit: '', color: C.destructive60 },
  tiempo: { label: 'Tiempo', unit: 's', color: C.success60 },
};
function metricMeta(key: string) {
  return METRIC_META[key] ?? { label: key.charAt(0).toUpperCase() + key.slice(1), unit: '', color: C.textSecondary };
}
function bestValueForMetric(session: ExerciseAnalysisSession, key: string): number | null {
  const nums = session.sets.map((s) => Number(s[key])).filter((n) => Number.isFinite(n));
  return nums.length > 0 ? Math.max(...nums) : null;
}
function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * HEADER_HEIGHT_RATIO;

type TabKey = 'muscle' | 'instructions' | 'equipment' | 'analysis';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'muscle', label: 'MÚSCULO' },
  { key: 'instructions', label: 'INSTRUCCIONES' },
  { key: 'equipment', label: 'EQUIPAMIENTO' },
  { key: 'analysis', label: 'ANÁLISIS' },
];

interface Props {
  navigation?: any;
  route?: any;
}

export default function ExerciseInfoScreen(props: Props) {
  const { navigation, route } = props;
  const exerciseId: number | undefined = route?.params?.id ?? route?.params?.mExerciseId;

  const [activeTab, setActiveTab] = useState<TabKey>(route?.params?.initialTab ?? 'muscle');
  const [detail, setDetail] = useState<ExerciseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const [analysis, setAnalysis] = useState<ExerciseAnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  const [tipsExpanded, setTipsExpanded] = useState(false);

  const loadDetail = useCallback(async (isRefresh = false) => {
    if (!exerciseId) {
      setError(true);
      setLoading(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const res = await exerciseInfoApi.getDetail(exerciseId);
      setDetail(res.data.data);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const loadAnalysis = useCallback(async () => {
    if (!exerciseId) return;
    setAnalysisLoading(true);
    setAnalysisError(false);
    try {
      const res = await exerciseInfoApi.getAnalysis(exerciseId);
      setAnalysis(res.data.data);
    } catch (e) {
      setAnalysisError(true);
    } finally {
      setAnalysisLoading(false);
    }
  }, [exerciseId]);

  const onRefresh = useCallback(() => {
    loadDetail(true);
    if (activeTab === 'analysis') loadAnalysis();
  }, [loadDetail, loadAnalysis, activeTab]);

  const onSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === 'analysis' && !analysis && !analysisLoading) {
      loadAnalysis();
    }
  };

  const onFeedback = async (value: 'like' | 'dislike') => {
    if (!detail || isSavingFeedback) return;
    const next = detail.user_feedback === value ? null : value;
    const prev = detail.user_feedback;
    setDetail({ ...detail, user_feedback: next });
    setIsSavingFeedback(true);
    try {
      await exerciseInfoApi.sendFeedback(detail.id, next);
    } catch (e) {
      setDetail((d) => (d ? { ...d, user_feedback: prev } : d));
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const toggleTips = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTipsExpanded((v) => !v);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ExerciseHeaderFloatingIcons
          onBack={() => navigation?.goBack()}
          isFavourite={false}
          onToggleFavourite={() => {}}
        />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !detail) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ExerciseHeaderFloatingIcons
          onBack={() => navigation?.goBack()}
          isFavourite={false}
          onToggleFavourite={() => {}}
        />
        <View style={styles.loader}>
          <ErrorRetryMem message="No se pudo cargar el ejercicio." onRetry={loadDetail} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ExerciseHeaderFloatingIcons
        onBack={() => navigation?.goBack()}
        isFavourite={detail.user_feedback === 'like'}
        onToggleFavourite={() => onFeedback('like')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.textSecondary} />
        }
      >
        <ExerciseMediaHeaderMem headerHeight={HEADER_HEIGHT} thumbnailUrl={detail.thumbnail_url} />

        <View style={styles.panel}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            {detail.muscle?.primary ? (
              <View style={styles.muscleBadge}>
                <Text style={styles.muscleBadgeText}>{detail.muscle.primary.name.toUpperCase()}</Text>
              </View>
            ) : null}
            {detail.is_popular ? (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MUY POPULAR</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title}>{detail.title}</Text>

          {/* Feedback row */}
          <View style={styles.feedbackRow}>
            <Text style={styles.feedbackText}>
              ¿Cómo te gustaría que te recomendemos este ejercicio?
            </Text>
            <View style={styles.feedbackBtns}>
              <TouchableOpacity
                style={[styles.feedbackBtn, detail.user_feedback === 'like' && styles.feedbackBtnActive]}
                onPress={() => onFeedback('like')}
              >
                <Ionicons
                  name="thumbs-up"
                  size={20}
                  color={detail.user_feedback === 'like' ? '#FFFFFF' : C.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feedbackBtn, detail.user_feedback === 'dislike' && styles.feedbackBtnActiveNegative]}
                onPress={() => onFeedback('dislike')}
              >
                <Ionicons
                  name="thumbs-down"
                  size={20}
                  color={detail.user_feedback === 'dislike' ? '#FFFFFF' : C.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab bar */}
          <View style={styles.tabBar}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabPill, activeTab === t.key && styles.tabPillActive]}
                onPress={() => onSelectTab(t.key)}
              >
                <Text style={[styles.tabPillText, activeTab === t.key && styles.tabPillTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab content */}
          <View style={styles.tabContent}>
            {activeTab === 'muscle' && (
              <MuscleTab primary={detail.muscle?.primary ?? null} secondary={detail.muscle?.secondary ?? []} />
            )}
            {activeTab === 'instructions' && (
              <InstructionsTab
                steps={detail.instructions?.steps ?? []}
                tips={detail.instructions?.tips ?? []}
                tipsExpanded={tipsExpanded}
                onToggleTips={toggleTips}
              />
            )}
            {activeTab === 'equipment' && <EquipmentTab equipment={detail.equipment} />}
            {activeTab === 'analysis' && (
              <AnalysisTab
                loading={analysisLoading}
                error={analysisError}
                data={analysis}
                onRetry={loadAnalysis}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MuscleTab({
  primary,
  secondary,
}: {
  primary: ExerciseDetailData['muscle']['primary'];
  secondary: ExerciseDetailData['muscle']['secondary'];
}) {
  return (
    <View>
      {primary ? (
        <View style={styles.muscleSection}>
          <Text style={styles.muscleSectionTitle}>PRINCIPAL</Text>
          <MuscleRow name={primary.name} iconUrl={primary.icon_url} />
        </View>
      ) : (
        <Text style={styles.emptyText}>No hay información muscular disponible.</Text>
      )}

      {secondary.length > 0 && (
        <View style={styles.muscleSection}>
          <Text style={styles.muscleSectionTitle}>SECUNDARIA</Text>
          {secondary.map((m, idx) => (
            <View key={`${m.name}-${idx}`}>
              <MuscleRow name={m.name} iconUrl={m.icon_url} />
              {idx < secondary.length - 1 && <View style={styles.rowSeparator} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function MuscleRow({ name, iconUrl }: { name: string; iconUrl: string | null }) {
  return (
    <View style={styles.muscleRow}>
      <View style={styles.muscleIconWrap}>
        {iconUrl ? (
          <Image source={{ uri: iconUrl }} style={styles.muscleIcon} resizeMode="cover" />
        ) : (
          <Ionicons name="body-outline" size={28} color={C.gray30} />
        )}
      </View>
      <Text style={styles.muscleRowText}>{name}</Text>
    </View>
  );
}

function InstructionsTab({
  steps,
  tips,
  tipsExpanded,
  onToggleTips,
}: {
  steps: string[];
  tips: string[];
  tipsExpanded: boolean;
  onToggleTips: () => void;
}) {
  return (
    <View>
      {steps.length === 0 ? (
        <Text style={styles.emptyText}>Aún no hay instrucciones disponibles para este ejercicio.</Text>
      ) : (
        steps.map((step, idx) => (
          <View key={idx}>
            <View style={styles.stepRow}>
              <Text style={styles.stepNumber}>{idx + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
            {idx < steps.length - 1 && <View style={styles.rowSeparator} />}
          </View>
        ))
      )}

      {tips.length > 0 && (
        <View style={styles.tipsSection}>
          <TouchableOpacity style={styles.tipsHeader} onPress={onToggleTips} activeOpacity={0.7}>
            <Text style={styles.tipsHeaderText}>CONSEJOS IMPORTANTES</Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={C.textSecondary}
              style={{ transform: [{ rotate: tipsExpanded ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>
          {tipsExpanded && (
            <View style={styles.tipsBody}>
              {tips.map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>{'•'}</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function EquipmentTab({ equipment }: { equipment: ExerciseDetailData['equipment'] }) {
  if (!equipment) {
    return <Text style={styles.emptyText}>Este ejercicio no requiere equipamiento.</Text>;
  }
  return (
    <View style={styles.equipmentRow}>
      {equipment.image_url ? (
        <Image source={{ uri: equipment.image_url }} style={styles.equipmentImage} resizeMode="cover" />
      ) : (
        <View style={[styles.equipmentImage, styles.equipmentImageFallback]}>
          <Ionicons name="barbell-outline" size={32} color={C.gray30} />
        </View>
      )}
      <Text style={styles.equipmentName}>{equipment.name}</Text>
    </View>
  );
}

function ProgressChartSection({ sessions }: { sessions: ExerciseAnalysisSession[] }) {
  // El backend devuelve las sesiones mas recientes primero (una fila por dia,
  // "el log mas reciente de cada dia" = estado final de esa sesion) —
  // invertimos para pintar la grafica en orden cronologico (izq = antiguo).
  const chronoSessions = useMemo(() => [...sessions].reverse(), [sessions]);

  const numericMetricKeys = useMemo(() => {
    const keys = new Set<string>();
    // "series" siempre disponible (se saca de sets.length, no de una clave
    // dentro de cada set) mientras haya al menos una sesion con series.
    if (chronoSessions.some((session) => session.sets.length > 0)) {
      keys.add(SERIES_METRIC_KEY);
    }
    chronoSessions.forEach((session) => {
      session.sets.forEach((set) => {
        Object.keys(set).forEach((k) => {
          if (EXCLUDED_METRIC_KEYS.includes(k)) return;
          const n = Number(set[k]);
          if (Number.isFinite(n)) keys.add(k);
        });
      });
    });
    // orden fijo y predecible: series, carga, reps, rir, rpe, tiempo, luego el resto
    const priority = ['series', 'carga', 'reps', 'rir', 'rpe', 'tiempo'];
    return Array.from(keys).sort((a, b) => {
      const ai = priority.indexOf(a);
      const bi = priority.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [chronoSessions]);

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  useEffect(() => {
    if (numericMetricKeys.length > 0 && selectedMetrics.length === 0) {
      setSelectedMetrics([numericMetricKeys[0]]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericMetricKeys]);

  const valuesByMetric = useMemo(() => {
    const map: Record<string, (number | null)[]> = {};
    numericMetricKeys.forEach((key) => {
      map[key] =
        key === SERIES_METRIC_KEY
          ? chronoSessions.map((session) => (session.sets.length > 0 ? session.sets.length : null))
          : chronoSessions.map((session) => bestValueForMetric(session, key));
    });
    return map;
  }, [chronoSessions, numericMetricKeys]);

  const toggleMetric = (key: string) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((k) => k !== key);
        return next.length > 0 ? next : prev; // siempre al menos una seleccionada
      }
      return [...prev, key];
    });
  };

  if (numericMetricKeys.length === 0) {
    return null;
  }

  const chartSeries = selectedMetrics.map((key) => ({
    key,
    color: metricMeta(key).color,
    values: valuesByMetric[key],
  }));

  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartSectionTitle}>Evolución</Text>

      <View style={styles.metricChipRow}>
        {numericMetricKeys.map((key) => {
          const meta = metricMeta(key);
          const active = selectedMetrics.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.metricChip, active && { backgroundColor: meta.color, borderColor: meta.color }]}
              onPress={() => toggleMetric(key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.metricChipText, active && styles.metricChipTextActive]}>{meta.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {chronoSessions.length < 2 ? (
        <Text style={styles.emptyText}>Necesitas al menos 2 sesiones registradas para ver la evolución.</Text>
      ) : (
        <>
          <MetricLineChart series={chartSeries} pointCount={chronoSessions.length} width={SCREEN_WIDTH - 72} height={170} />
          <View style={styles.chartDateRow}>
            <Text style={styles.chartDateText}>{formatShortDate(chronoSessions[0].date)}</Text>
            <Text style={styles.chartDateText}>{formatShortDate(chronoSessions[chronoSessions.length - 1].date)}</Text>
          </View>
          <View style={styles.legendWrap}>
            {selectedMetrics.map((key) => {
              const meta = metricMeta(key);
              const values = valuesByMetric[key].filter((v): v is number => v !== null);
              const latest = values.length > 0 ? values[values.length - 1] : null;
              return (
                <View key={key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: meta.color }]} />
                  <Text style={styles.legendText}>
                    {meta.label}: {latest !== null ? `${latest}${meta.unit ? ` ${meta.unit}` : ''}` : '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

function AnalysisTab({
  loading,
  error,
  data,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  data: ExerciseAnalysisData | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View style={{ paddingVertical: 30 }}>
        <ActivityIndicator size="small" color={C.textPrimary} />
      </View>
    );
  }
  if (error) {
    return <ErrorRetryMem message="No se pudo cargar el historial." onRetry={onRetry} />;
  }
  if (!data || data.total_sessions === 0) {
    return <Text style={styles.emptyText}>Aún no hay datos.</Text>;
  }
  return (
    <View>
      <ProgressChartSection sessions={data.sessions} />
      {data.sessions.map((session, idx) => (
        <AnalysisHistoryCardMem key={`${session.date}-${idx}`} session={session} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  panel: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  muscleBadge: {
    backgroundColor: C.brand20,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  muscleBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: C.textPrimary,
    letterSpacing: 0.5,
  },
  popularBadge: {
    backgroundColor: C.warning10,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  popularBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: C.warning40,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FONT.extraBold,
    fontSize: 30,
    color: C.white,
    marginBottom: 18,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  feedbackText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    marginRight: 12,
  },
  feedbackBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  feedbackBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBtnActive: {
    backgroundColor: C.success60,
  },
  feedbackBtnActiveNegative: {
    backgroundColor: C.destructive60,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.surfaceLight,
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 26,
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: C.brand50,
  },
  tabPillText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: C.textSecondary,
    letterSpacing: 0.3,
  },
  tabPillTextActive: {
    color: C.white,
  },
  tabContent: {
    minHeight: 200,
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    paddingVertical: 30,
  },
  muscleSection: {
    marginBottom: 20,
  },
  muscleSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: C.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  muscleIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: C.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  muscleIcon: {
    width: 64,
    height: 64,
  },
  muscleRowText: {
    marginLeft: 14,
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: C.white,
  },
  rowSeparator: {
    height: 1,
    backgroundColor: C.border,
  },
  stepRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  stepNumber: {
    width: 28,
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.textPrimary,
  },
  stepText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.white,
    lineHeight: 21,
  },
  tipsSection: {
    marginTop: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 14,
    padding: 14,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipsHeaderText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: C.white,
    letterSpacing: 0.5,
  },
  tipsBody: {
    marginTop: 12,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    width: 16,
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.textSecondary,
  },
  tipText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 20,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  equipmentImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  equipmentImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceLight,
  },
  equipmentName: {
    marginLeft: 16,
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: C.white,
    flex: 1,
  },
  chartSection: {
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.white,
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  metricChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  metricChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  metricChipText: {
    fontFamily: FONT.semiBold,
    fontSize: 11.5,
    color: C.textSecondary,
  },
  metricChipTextActive: {
    color: '#FFFFFF',
  },
  chartDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chartDateText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: C.textSecondary,
  },
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: C.white,
  },
});
