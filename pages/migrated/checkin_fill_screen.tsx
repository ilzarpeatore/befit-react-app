import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import {
  checkinsApi,
  CheckInForm,
  CheckInQuestion,
  CheckInAnswerInput,
  UNSUPPORTED_QUESTION_TYPES,
} from '../../api/checkins';

type AnswerValue = string | string[];

// Mismo patrón visual que el ScaleRow del chequeo de preparación
// (workout_preview_screen.tsx) - números o estrellas en fila, tap para elegir.
function ChoiceRow({
  count,
  value,
  onChange,
  icon,
}: {
  count: number;
  value: number | null;
  onChange: (v: number) => void;
  icon?: boolean;
}) {
  return (
    <View style={s.scaleRow}>
      {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
        <TouchableOpacity
          key={n}
          style={[s.scaleChip, value !== null && n <= value && s.scaleChipActive]}
          onPress={() => onChange(n)}
          activeOpacity={0.75}
        >
          {icon ? (
            <Ionicons name="star" size={16} color={value !== null && n <= value ? '#FFFFFF' : C.textSecondary} />
          ) : (
            <Text style={[s.scaleChipText, value !== null && n <= value && s.scaleChipTextActive]}>{n}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function QuestionCard({
  question,
  value,
  onChange,
}: {
  question: CheckInQuestion;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  const unsupported = UNSUPPORTED_QUESTION_TYPES.includes(question.type);

  return (
    <View style={s.card}>
      <Text style={s.question}>
        {question.question_text}
        {question.is_required && <Text style={s.required}> *</Text>}
      </Text>

      {unsupported ? (
        <View style={s.unsupportedBox}>
          <Ionicons name="information-circle-outline" size={16} color={C.warning60} />
          <Text style={s.unsupportedText}>
            Este tipo de pregunta (foto/firma) aún no se puede responder desde la app. Pídele a tu coach que te ayude a completarlo por otro medio.
          </Text>
        </View>
      ) : question.type === 'text' ? (
        <TextInput
          style={s.input}
          placeholder={question.placeholder || 'Tu respuesta'}
          placeholderTextColor={C.textTertiary}
          value={(value as string) || ''}
          onChangeText={(t) => onChange(t)}
        />
      ) : question.type === 'textarea' ? (
        <TextInput
          style={[s.input, s.inputMultiline]}
          placeholder={question.placeholder || 'Tu respuesta'}
          placeholderTextColor={C.textTertiary}
          value={(value as string) || ''}
          onChangeText={(t) => onChange(t)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      ) : question.type === 'number' || question.type === 'metric' ? (
        <>
          <TextInput
            style={s.input}
            placeholder={question.placeholder || '0'}
            placeholderTextColor={C.textTertiary}
            value={(value as string) || ''}
            onChangeText={(t) => onChange(t.replace(/[^0-9.\-]/g, ''))}
            keyboardType="decimal-pad"
          />
          {question.type === 'metric' && question.metric && (
            <Text style={s.hint}>Se sincroniza con {question.metric.label}{question.metric.unit ? ` (${question.metric.unit})` : ''}</Text>
          )}
        </>
      ) : question.type === 'date' ? (
        <TextInput
          style={s.input}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={C.textTertiary}
          value={(value as string) || ''}
          onChangeText={(t) => onChange(t)}
        />
      ) : question.type === 'scale' ? (
        <ChoiceRow count={question.scale_max || 10} value={value ? Number(value) : null} onChange={(n) => onChange(String(n))} />
      ) : question.type === 'star_rating' ? (
        <ChoiceRow count={question.star_max || 5} value={value ? Number(value) : null} onChange={(n) => onChange(String(n))} icon />
      ) : question.type === 'yes_no' ? (
        <View style={s.yesNoRow}>
          {(['yes', 'no'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[s.yesNoChip, value === opt && s.yesNoChipActive]}
              onPress={() => onChange(opt)}
              activeOpacity={0.75}
            >
              <Text style={[s.yesNoChipText, value === opt && s.yesNoChipTextActive]}>{opt === 'yes' ? 'Sí' : 'No'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : question.type === 'multiple_choice' ? (
        <View style={s.chipsWrap}>
          {(question.options || []).map((opt) => {
            const selected = question.allow_multiple
              ? Array.isArray(value) && value.includes(opt)
              : value === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[s.optionChip, selected && s.optionChipActive]}
                activeOpacity={0.75}
                onPress={() => {
                  if (question.allow_multiple) {
                    const current = Array.isArray(value) ? value : [];
                    onChange(current.includes(opt) ? current.filter((o) => o !== opt) : [...current, opt]);
                  } else {
                    onChange(opt);
                  }
                }}
              >
                <Text style={[s.optionChipText, selected && s.optionChipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function isAnswered(v: AnswerValue | undefined): boolean {
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return v.trim().length > 0;
}

interface Props {
  navigation?: any;
  route?: any;
}

export default function CheckInFillScreen(props: Props) {
  const { navigation, route } = props;
  const insets = useSafeAreaInsets();
  const formAssignmentId: number | undefined = route?.params?.formAssignmentId;
  const formId: number | undefined = route?.params?.formId;
  const fallbackTitle: string | undefined = route?.params?.title;

  const [form, setForm] = useState<CheckInForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!formId) { setError(true); setIsLoading(false); return; }
    setIsLoading(true);
    setError(false);
    try {
      const res = await checkinsApi.getFormDetail(formId);
      setForm(res.data?.data ?? null);
    } catch (e) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  useEffect(() => { load(); }, [load]);

  const questions = useMemo(() => form?.questions ?? [], [form]);

  const blockingQuestions = useMemo(
    () => questions.filter((q) => q.is_required && UNSUPPORTED_QUESTION_TYPES.includes(q.type)),
    [questions]
  );
  const missingRequired = useMemo(
    () => questions.filter((q) => q.is_required && !UNSUPPORTED_QUESTION_TYPES.includes(q.type) && !isAnswered(answers[q.id])),
    [questions, answers]
  );
  const canSubmit = blockingQuestions.length === 0 && missingRequired.length === 0;

  const handleSubmit = async () => {
    if (!canSubmit || !formAssignmentId) return;
    setSubmitting(true);
    try {
      const payload: CheckInAnswerInput[] = questions
        .filter((q) => !UNSUPPORTED_QUESTION_TYPES.includes(q.type) && isAnswered(answers[q.id]))
        .map((q) => ({ form_question_id: q.id, answer_value: answers[q.id] as string | string[] }));

      await checkinsApi.submit(formAssignmentId, payload);
      Alert.alert('Enviado', 'Tu respuesta se ha guardado correctamente.', [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar el formulario. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{form?.title || fallbackTitle || 'Formulario'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      ) : error || !form ? (
        <View style={s.center}>
          <Text style={s.emptyText}>No se pudo cargar el formulario.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {form.description && <Text style={s.description}>{form.description}</Text>}

            {questions.length === 0 ? (
              <View style={s.center}>
                <Text style={s.emptyText}>Este formulario todavía no tiene preguntas.</Text>
              </View>
            ) : (
              questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  value={answers[q.id]}
                  onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                />
              ))
            )}
          </ScrollView>

          <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
            {blockingQuestions.length > 0 && (
              <Text style={s.blockedHint}>Hay preguntas obligatorias que requieren completarse por otro medio.</Text>
            )}
            <TouchableOpacity
              style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={s.submitBtnText}>ENVIAR</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: FONT.bold, fontSize: 16, color: C.textPrimary, marginHorizontal: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyText: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary, textAlign: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  description: { fontFamily: FONT.regular, fontSize: 13.5, color: C.textSecondary, marginBottom: 16, lineHeight: 19 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...SHADOW.card,
  },
  question: { fontFamily: FONT.bold, fontSize: 14.5, color: C.textPrimary, marginBottom: 10 },
  required: { color: C.destructive },
  input: {
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONT.medium,
    fontSize: 14,
    color: C.textPrimary,
  },
  inputMultiline: { minHeight: 90, paddingTop: 12 },
  hint: { fontFamily: FONT.regular, fontSize: 11.5, color: C.textSecondary, marginTop: 6 },
  scaleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scaleChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleChipActive: { backgroundColor: C.accentBlack },
  scaleChipText: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary },
  scaleChipTextActive: { color: '#FFFFFF' },
  yesNoRow: { flexDirection: 'row', gap: 10 },
  yesNoChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
  },
  yesNoChipActive: { backgroundColor: C.accentBlack },
  yesNoChipText: { fontFamily: FONT.bold, fontSize: 14, color: C.textSecondary },
  yesNoChipTextActive: { color: '#FFFFFF' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: C.bg,
  },
  optionChipActive: { backgroundColor: C.accentBlack },
  optionChipText: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.textSecondary },
  optionChipTextActive: { color: '#FFFFFF' },
  unsupportedBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: C.warning5,
    borderRadius: 12,
    padding: 10,
    alignItems: 'flex-start',
  },
  unsupportedText: { flex: 1, fontFamily: FONT.regular, fontSize: 12, color: C.warning60, lineHeight: 17 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  blockedHint: { fontFamily: FONT.medium, fontSize: 12, color: C.warning60, textAlign: 'center', marginBottom: 8 },
  submitBtn: {
    backgroundColor: C.accentBlack,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnText: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF', letterSpacing: 0.5 },
});
