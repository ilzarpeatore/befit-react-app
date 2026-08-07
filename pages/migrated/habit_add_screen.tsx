import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import { habitsApi, HabitTemplate, HabitFrequency } from '../../api/habits';
import { HABIT_ICON_KEYS, habitIoniconFor } from '../../constants/habitIcons';

const GOAL_UNITS = ['veces', 'min', 'horas', 'vasos', 'km', 'pasos', 'sesiones', 'páginas'];

interface Props {
  navigation?: any;
}

export default function HabitAddScreen(props: Props) {
  const { navigation } = props;
  const [tab, setTab] = useState<'library' | 'create'>('library');

  const [templates, setTemplates] = useState<HabitTemplate[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [errorLibrary, setErrorLibrary] = useState(false);
  const [adoptingId, setAdoptingId] = useState<number | null>(null);

  const [icon, setIcon] = useState<string>('fitness');
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('veces');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [submitting, setSubmitting] = useState(false);

  const loadLibrary = useCallback(async () => {
    setLoadingLibrary(true);
    setErrorLibrary(false);
    try {
      const res = await habitsApi.getLibrary();
      setTemplates(res.data?.data ?? []);
    } catch (e) {
      setErrorLibrary(true);
    } finally {
      setLoadingLibrary(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadLibrary(); }, [loadLibrary]));

  const adopt = async (t: HabitTemplate) => {
    if (adoptingId) return;
    setAdoptingId(t.id);
    try {
      const res = await habitsApi.adopt(t.id);
      const newId = res.data?.data?.id;
      if (newId) {
        navigation?.replace ? navigation.replace('MigratedHabitDetail', { habitId: newId }) : navigation?.navigate('MigratedHabitDetail', { habitId: newId });
      } else {
        navigation?.goBack();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo añadir este hábito.';
      Alert.alert('Aviso', msg);
    } finally {
      setAdoptingId(null);
    }
  };

  const submitPersonal = async () => {
    if (!title.trim()) {
      Alert.alert('Falta el nombre', 'Ponle un nombre a tu hábito.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await habitsApi.createPersonal({
        title: title.trim(),
        icon,
        target_value: targetValue ? Number(targetValue) : null,
        target_unit: targetValue ? targetUnit : null,
        frequency,
      });
      const newId = res.data?.data?.id;
      if (newId) {
        navigation?.replace ? navigation.replace('MigratedHabitDetail', { habitId: newId }) : navigation?.navigate('MigratedHabitDetail', { habitId: newId });
      } else {
        navigation?.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo crear el hábito. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Añadir hábito</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity style={[styles.tab, tab === 'library' && styles.tabActive]} onPress={() => setTab('library')} activeOpacity={0.75}>
          <Text style={[styles.tabText, tab === 'library' && styles.tabTextActive]}>Biblioteca</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'create' && styles.tabActive]} onPress={() => setTab('create')} activeOpacity={0.75}>
          <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>Crear el mío</Text>
        </TouchableOpacity>
      </View>

      {tab === 'library' ? (
        loadingLibrary ? (
          <View style={styles.center}><ActivityIndicator size="large" color={C.textPrimary} /></View>
        ) : errorLibrary ? (
          <View style={styles.center}><Text style={styles.emptyText}>No se pudo cargar la biblioteca.</Text></View>
        ) : templates.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="library-outline" size={36} color={C.textSecondary} />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>Tu coach todavía no ha añadido hábitos a la biblioteca. Puedes crear el tuyo propio.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {templates.map((t) => (
              <View key={t.id} style={styles.libraryRow}>
                <View style={styles.iconWrap}>
                  <Ionicons name={habitIoniconFor(t.icon)} size={20} color={C.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.libraryTitle}>{t.title}</Text>
                  {t.target_value && t.target_unit && (
                    <Text style={styles.librarySub}>{t.target_value} {t.target_unit} / {t.frequency === 'daily' ? 'día' : 'semana'}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => adopt(t)} disabled={adoptingId === t.id}>
                  {adoptingId === t.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="add" size={20} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Icono</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICON_KEYS.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.iconOption, icon === key && styles.iconOptionActive]}
                  onPress={() => setIcon(key)}
                  activeOpacity={0.75}
                >
                  <Ionicons name={habitIoniconFor(key)} size={19} color={icon === key ? '#FFFFFF' : C.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="p. ej. Beber agua"
              placeholderTextColor={C.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />

            <Text style={styles.label}>Objetivo (opcional)</Text>
            <View style={styles.goalRow}>
              <TextInput
                style={[styles.input, styles.goalInput]}
                placeholder="8"
                placeholderTextColor={C.textTertiary}
                value={targetValue}
                onChangeText={(t) => setTargetValue(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={styles.chipsWrap}>
                  {GOAL_UNITS.map((u) => (
                    <TouchableOpacity key={u} style={[styles.unitChip, targetUnit === u && styles.unitChipActive]} onPress={() => setTargetUnit(u)}>
                      <Text style={[styles.unitChipText, targetUnit === u && styles.unitChipTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <Text style={styles.label}>Frecuencia</Text>
            <View style={styles.freqRow}>
              {(['daily', 'weekly'] as HabitFrequency[]).map((f) => (
                <TouchableOpacity key={f} style={[styles.freqChip, frequency === f && styles.freqChipActive]} onPress={() => setFrequency(f)}>
                  <Text style={[styles.freqChipText, frequency === f && styles.freqChipTextActive]}>{f === 'daily' ? 'Diario' : 'Semanal'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={submitPersonal} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitBtnText}>CREAR HÁBITO</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: FONT.bold, fontSize: 17, color: C.textPrimary },
  tabsRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 14, padding: 4, marginHorizontal: 20, marginBottom: 14, ...SHADOW.card },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: C.accentBlack },
  tabText: { fontFamily: FONT.semiBold, fontSize: 13, color: C.textSecondary },
  tabTextActive: { color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyText: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary, textAlign: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    ...SHADOW.card,
  },
  iconWrap: { width: 42, height: 42, borderRadius: 13, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  libraryTitle: { fontFamily: FONT.bold, fontSize: 14, color: C.textPrimary },
  librarySub: { fontFamily: FONT.regular, fontSize: 11.5, color: C.textSecondary, marginTop: 2 },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentBlack, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FONT.bold, fontSize: 12.5, color: C.textSecondary, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.3 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  iconOptionActive: { backgroundColor: C.accentBlack },
  input: {
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: FONT.medium,
    fontSize: 14,
    color: C.textPrimary,
    ...SHADOW.card,
  },
  goalRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  goalInput: { width: 72, textAlign: 'center' },
  chipsWrap: { flexDirection: 'row', gap: 8 },
  unitChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: C.surface, ...SHADOW.card },
  unitChipActive: { backgroundColor: C.accentBlack },
  unitChipText: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.textSecondary },
  unitChipTextActive: { color: '#FFFFFF' },
  freqRow: { flexDirection: 'row', gap: 10 },
  freqChip: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: C.surface, alignItems: 'center', ...SHADOW.card },
  freqChipActive: { backgroundColor: C.accentBlack },
  freqChipText: { fontFamily: FONT.bold, fontSize: 13.5, color: C.textSecondary },
  freqChipTextActive: { color: '#FFFFFF' },
  submitBtn: { marginTop: 28, backgroundColor: C.accentBlack, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF', letterSpacing: 0.5 },
});
