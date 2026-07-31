import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';

interface Props {
  navigation?: any;
  route?: any;
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
    return `¡Hoy levantaste el equivalente a ${count} veces ${ref.name}! ${ref.emoji}`;
  }
  if (multiple >= 0.85) {
    return `¡Hoy levantaste el equivalente a ${ref.name}! ${ref.emoji}`;
  }
  const percent = Math.round(multiple * 100);
  return `Hoy levantaste el ${percent}% del peso de ${ref.name} ${ref.emoji}`;
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m} min`;
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

export default function WorkoutSummaryScreen(props: Props) {
  const { navigation, route } = props;
  const {
    mTitle,
    durationSeconds = 0,
    volumeKg = 0,
    exerciseCount = 0,
    completedSets = 0,
    difficultyRating,
  } = route?.params ?? {};

  const funFact = getFunFact(volumeKg);

  const onDone = () => {
    if (typeof navigation?.popToTop === 'function') {
      navigation.popToTop();
    } else {
      navigation?.navigate('HomePage');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={44} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>¡Enhorabuena!</Text>
        <Text style={styles.subtitle}>Has completado {mTitle || 'tu entrenamiento'}</Text>

        {funFact ? (
          <View style={styles.funFactCard}>
            <Text style={styles.funFactText}>{funFact}</Text>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatDuration(durationSeconds)}</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{volumeKg}</Text>
            <Text style={styles.statLabel}>Kg totales</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{exerciseCount}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedSets}</Text>
            <Text style={styles.statLabel}>Series</Text>
          </View>
        </View>

        {difficultyRating ? (
          <View style={styles.difficultyRow}>
            <Text style={styles.difficultyEmoji}>{DIFFICULTY_EMOJI[difficultyRating]}</Text>
            <Text style={styles.difficultyText}>
              Te ha parecido: <Text style={styles.difficultyTextBold}>{DIFFICULTY_LABEL[difficultyRating]}</Text>
            </Text>
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
  scrollContent: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FONT.extraBold,
    fontSize: 28,
    color: C.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  funFactCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 28,
    width: '100%',
  },
  funFactText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginTop: 28,
    gap: 12,
  },
  statBox: {
    width: '47%',
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONT.extraBold,
    fontSize: 22,
    color: C.textPrimary,
  },
  statLabel: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: C.surfaceLight,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  difficultyEmoji: { fontSize: 18 },
  difficultyText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
  },
  difficultyTextBold: {
    fontFamily: FONT.bold,
    color: C.textPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  doneBtn: {
    backgroundColor: C.brand50,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: C.textPrimary,
    letterSpacing: 0.5,
  },
});
