import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, FONT } from './theme';
import { workoutHistoryApi } from '../../api/workoutHistory';

interface Props {
  navigation?: any;
  route?: any;
}

const DIFFICULTY_OPTIONS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: '😩', label: 'Muy duro' },
  { value: 2, emoji: '😕', label: 'Duro' },
  { value: 3, emoji: '🙂', label: 'Normal' },
  { value: 4, emoji: '💪', label: 'Fácil' },
  { value: 5, emoji: '🔥', label: 'Genial' },
];

export default function WorkoutFeedbackScreen(props: Props) {
  const { navigation, route } = props;
  const {
    programDayAssignmentId,
    workoutTemplateId,
    mTitle,
    durationSeconds = 0,
    volumeKg = 0,
    caloriesBurned = 0,
    exerciseCount = 0,
    completedSets = 0,
    exerciseIds = [],
  } = route?.params ?? {};

  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const goToSummary = (caloriesFinal?: number | null, achievements?: any) => {
    navigation?.replace('MigratedWorkoutSummary', {
      mTitle,
      durationSeconds,
      volumeKg,
      caloriesBurned: caloriesFinal ?? caloriesBurned,
      exerciseCount,
      completedSets,
      difficultyRating: difficulty,
      achievements,
    });
  };

  const onContinue = async () => {
    setIsSaving(true);
    try {
      const res = await workoutHistoryApi.finishCalendarSession({
        program_day_assignment_id: programDayAssignmentId,
        workout_template_id: workoutTemplateId,
        duration_seconds: durationSeconds,
        volume_kg: volumeKg,
        difficulty_rating: difficulty ?? undefined,
        comment: comment.trim() || undefined,
        exercise_ids: exerciseIds,
      });
      goToSummary(res.data?.data?.calories_burned, res.data?.achievements);
    } catch (e) {
      // No bloqueamos el resumen local por un fallo de red — el dato ya
      // se fue guardando serie a serie durante la sesión.
      goToSummary();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>¡Entrenamiento completado!</Text>
          <Text style={styles.subtitle}>{mTitle || 'Entrenamiento'}</Text>

          <Text style={styles.question}>¿Cómo te ha resultado hoy?</Text>
          <View style={styles.emojiRow}>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.emojiOption}
                activeOpacity={0.7}
                onPress={() => setDifficulty(opt.value)}
              >
                <View style={[styles.emojiCircle, difficulty === opt.value && styles.emojiCircleActive]}>
                  <Text style={styles.emoji}>{opt.emoji}</Text>
                </View>
                <Text style={[styles.emojiLabel, difficulty === opt.value && styles.emojiLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.question}>¿Algo que quieras contarnos?</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Cómo te has sentido, alguna molestia, qué te gustaría cambiar..."
            placeholderTextColor={C.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.85}
            onPress={onContinue}
            disabled={isSaving}
          >
            <Text style={styles.continueBtnText}>{isSaving ? 'Guardando...' : 'CONTINUAR'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: {
    fontFamily: FONT.extraBold,
    fontSize: 24,
    color: C.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
  },
  question: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: C.textPrimary,
    marginBottom: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  emojiOption: { alignItems: 'center', flex: 1 },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCircleActive: {
    backgroundColor: '#1C1C1E',
  },
  emoji: { fontSize: 24 },
  emojiLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  emojiLabelActive: {
    color: C.textPrimary,
    fontFamily: FONT.bold,
  },
  commentInput: {
    backgroundColor: C.surfaceLight,
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.textPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 16 : 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  continueBtn: {
    backgroundColor: C.brand50,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: C.textPrimary,
    letterSpacing: 0.5,
  },
});
