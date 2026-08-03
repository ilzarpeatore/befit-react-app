import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT, SHADOW } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  navigation?: any;
  route?: any;
}

interface Achievements {
  weight_up_count?: number;
  weight_up_exercises?: string[];
  reps_up_count?: number;
  reps_up_exercises?: string[];
  better_rpe_count?: number;
  better_rpe_exercises?: string[];
}

interface FunReference {
  name: string;
  weightKg: number;
  emoji: string;
}

// Referencias de peso reales, de mayor a menor — se elige la mayor que
// quepa al menos una vez en el volumen total, para que la comparación
// nunca sea "0.01 elefantes".
const FUN_REFERENCES: FunReference[] = [
  { name: 'un elefante africano', weightKg: 6000, emoji: '🐘' },
  { name: 'un coche utilitario', weightKg: 1200, emoji: '🚗' },
  { name: 'un oso pardo', weightKg: 400, emoji: '🐻' },
  { name: 'un piano de cola', weightKg: 300, emoji: '🎹' },
  { name: 'una moto', weightKg: 180, emoji: '🏍️' },
  { name: 'un gran danés', weightKg: 70, emoji: '🐕' },
];

function getFunFact(volumeKg: number): string | null {
  if (!volumeKg || volumeKg <= 0) return null;
  const ref = FUN_REFERENCES.find((r) => volumeKg >= r.weightKg) ?? FUN_REFERENCES[FUN_REFERENCES.length - 1];
  const multiple = volumeKg / ref.weightKg;

  if (multiple >= 1.15) {
    const count = Math.round(multiple * 10) / 10;
    return `Hoy levantaste el equivalente a ${count} veces ${ref.name}`;
  }
  if (multiple >= 0.85) {
    return `Hoy levantaste el equivalente a ${ref.name}`;
  }
  const percent = Math.round(multiple * 100);
  return `Hoy levantaste el ${percent}% del peso de ${ref.name}`;
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}min`;
}

function joinExerciseNames(names: string[] | undefined): string {
  if (!names || names.length === 0) return '';
  if (names.length <= 2) return names.join(' · ');
  return `${names.slice(0, 2).join(' · ')} +${names.length - 2}`;
}

function todayLabel(): string {
  const d = new Date();
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

const DIFFICULTY_EMOJI: Record<number, string> = {
  1: '😩',
  2: '😕',
  3: '🙂',
  4: '💪',
  5: '🔥',
};
const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Muy duro',
  2: 'Duro',
  3: 'Normal',
  4: 'Fácil',
  5: 'Genial',
};

function HeroStat({ icon, value, label, accent }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; accent: string }) {
  return (
    <View style={styles.heroStat}>
      <View style={[styles.heroStatIconWrap, { backgroundColor: accent }]}>
        <Ionicons name={icon} size={17} color="#FFFFFF" />
      </View>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function AchievementCard({
  icon,
  color,
  bg,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={[styles.achievementCard, { backgroundColor: bg }]}>
      <View style={styles.achievementIconWrap}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.achievementTitle, { color }]}>{title}</Text>
      {subtitle ? (
        <Text style={styles.achievementSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export default function WorkoutSummaryScreen(props: Props) {
  const { navigation, route } = props;
  const {
    mTitle,
    durationSeconds = 0,
    volumeKg = 0,
    caloriesBurned = 0,
    exerciseCount = 0,
    completedSets = 0,
    difficultyRating,
    achievements,
  } = route?.params ?? {};

  const funFact = getFunFact(volumeKg);
  const ach: Achievements = achievements ?? {};
  const achievementCards = [
    (ach.weight_up_count ?? 0) > 0 && {
      key: 'weight',
      icon: 'trending-up' as const,
      color: C.success60,
      bg: C.success5,
      title: `+carga en ${ach.weight_up_count}`,
      subtitle: joinExerciseNames(ach.weight_up_exercises),
    },
    (ach.reps_up_count ?? 0) > 0 && {
      key: 'reps',
      icon: 'repeat' as const,
      color: C.blue60,
      bg: C.blue5,
      title: `+reps en ${ach.reps_up_count}`,
      subtitle: joinExerciseNames(ach.reps_up_exercises),
    },
    (ach.better_rpe_count ?? 0) > 0 && {
      key: 'rpe',
      icon: 'happy' as const,
      color: C.purple60,
      bg: C.purple5,
      title: `Mejor sensación en ${ach.better_rpe_count}`,
      subtitle: joinExerciseNames(ach.better_rpe_exercises),
    },
  ].filter(Boolean) as { key: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; title: string; subtitle: string }[];

  const onDone = () => {
    if (typeof navigation?.popToTop === 'function') {
      navigation.popToTop();
    } else {
      navigation?.navigate('MigratedHomeModern');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <LinearGradient colors={['#1C1C1E', C.accentBlack]} style={styles.hero}>
          <View style={[styles.heroDot, styles.heroDot1]} />
          <View style={[styles.heroDot, styles.heroDot2]} />
          <View style={[styles.heroDot, styles.heroDot3]} />

          <View style={styles.heroPill}>
            <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
            <Text style={styles.heroPillText}>ENTRENAMIENTO COMPLETADO</Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {mTitle || 'Tu entrenamiento'}
          </Text>
          <Text style={styles.heroDate}>{todayLabel()}</Text>
        </LinearGradient>

        {/* ── Medalla flotante ── */}
        <View style={styles.medalWrap}>
          <LinearGradient colors={['#FFD76A', '#FF9F45']} style={styles.medal}>
            <Ionicons name="trophy" size={30} color="#FFFFFF" />
          </LinearGradient>
        </View>

        {/* ── Métricas hero ── */}
        <View style={styles.heroStatsRow}>
          <HeroStat icon="time" value={formatDuration(durationSeconds)} label="Duración" accent={C.blue60} />
          <View style={styles.heroStatDivider} />
          <HeroStat icon="flame" value={String(Math.round(caloriesBurned))} label="Kcal" accent={C.warning60} />
          <View style={styles.heroStatDivider} />
          <HeroStat icon="barbell" value={String(volumeKg)} label="Kg totales" accent={C.accentBlack} />
        </View>

        {/* ── Secundarias ── */}
        <View style={styles.secondaryRow}>
          <View style={styles.secondaryPill}>
            <Text style={styles.secondaryValue}>{exerciseCount}</Text>
            <Text style={styles.secondaryLabel}>Ejercicios</Text>
          </View>
          <View style={styles.secondaryPill}>
            <Text style={styles.secondaryValue}>{completedSets}</Text>
            <Text style={styles.secondaryLabel}>Series</Text>
          </View>
          {difficultyRating ? (
            <View style={styles.secondaryPill}>
              <Text style={styles.secondaryValueEmoji}>{DIFFICULTY_EMOJI[difficultyRating]}</Text>
              <Text style={styles.secondaryLabel}>{DIFFICULTY_LABEL[difficultyRating]}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Logros ── */}
        {achievementCards.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionHeader}>Tus logros de hoy</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScroll}
            >
              {achievementCards.map((a) => (
                <AchievementCard key={a.key} icon={a.icon} color={a.color} bg={a.bg} title={a.title} subtitle={a.subtitle} />
              ))}
            </ScrollView>
          </View>
        )}

        {funFact ? (
          <View style={styles.funFactCard}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginBottom: 8 }} />
            <Text style={styles.funFactText}>{funFact}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} activeOpacity={0.85} onPress={onDone}>
          <Text style={styles.doneBtnText}>VOLVER AL INICIO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 24 },
  hero: {
    width: SCREEN_WIDTH,
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroDot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroDot1: { width: 160, height: 160, top: -60, right: -50 },
  heroDot2: { width: 90, height: 90, bottom: -30, left: -30 },
  heroDot3: { width: 50, height: 50, top: 30, left: 30 },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroPillText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroDate: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 6,
    textTransform: 'capitalize',
  },
  medalWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: -34,
  },
  medal: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: C.bg,
    ...SHADOW.card,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 22,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 20,
    ...SHADOW.card,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: C.border,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroStatValue: {
    fontFamily: FONT.extraBold,
    fontSize: 20,
    color: C.textPrimary,
  },
  heroStatLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 12,
  },
  secondaryPill: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    ...SHADOW.card,
  },
  secondaryValue: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.textPrimary,
  },
  secondaryValueEmoji: {
    fontSize: 17,
  },
  secondaryLabel: {
    fontFamily: FONT.regular,
    fontSize: 10.5,
    color: C.textSecondary,
    marginTop: 3,
  },
  achievementsSection: {
    marginTop: 26,
  },
  sectionHeader: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  achievementsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  achievementCard: {
    width: 158,
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
  },
  achievementIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 14,
  },
  achievementSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 4,
  },
  funFactCard: {
    backgroundColor: C.accentBlack,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginTop: 24,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  funFactText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  doneBtn: {
    backgroundColor: C.accentBlack,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
