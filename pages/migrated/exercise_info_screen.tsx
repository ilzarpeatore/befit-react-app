import React, { useCallback, useEffect, useState } from 'react';
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
import {
  exerciseInfoApi,
  ExerciseDetailData,
  ExerciseAnalysisData,
} from '../../api/exerciseInfo';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
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

  const [activeTab, setActiveTab] = useState<TabKey>('muscle');
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
});
