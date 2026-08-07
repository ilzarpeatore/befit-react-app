import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from '../pages/migrated/theme';
import { screenReviewApi, ScreenReviewStatus, ScreenReviewMark } from '../api/screenReview';

// Herramienta TEMPORAL de desarrollo pedida para revisar las 200+ pantallas
// migradas: FAB visible en toda la app que deja marcar cada pantalla como
// "borrar" / "terminada" / "no entiendo" (+ nota libre en estas dos
// ultimas), guardado en el backend para que luego se pueda consultar.
// Se borra este archivo + api/screenReview.ts + el mount en App.tsx + la
// migracion/modelo/controller/rutas del backend cuando ya no haga falta.

interface Props {
  navigationRef: any;
}

type Step = 'menu' | 'note' | 'saved';

const STATUS_META: Record<ScreenReviewStatus, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  delete: { label: 'Marcar para borrar', icon: 'trash-outline', color: C.destructive60 },
  done: { label: 'Marcar como terminada', icon: 'checkmark-circle-outline', color: C.success60 },
  confused: { label: 'No entiendo esta pantalla', icon: 'help-circle-outline', color: C.warning60 },
};

export default function ScreenReviewFab({ navigationRef }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>('menu');
  const [pendingStatus, setPendingStatus] = useState<ScreenReviewStatus | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [routeName, setRouteName] = useState<string>('');
  const [existingMark, setExistingMark] = useState<ScreenReviewMark | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const open = () => {
    const current = navigationRef?.current?.getCurrentRoute?.()?.name || 'Desconocida';
    setRouteName(current);
    setStep('menu');
    setPendingStatus(null);
    setNote('');
    setExistingMark(null);
    setVisible(true);
    setLoadingExisting(true);
    screenReviewApi
      .getForRoute(current)
      .then((res) => {
        const found = res.data?.data?.[0] ?? null;
        setExistingMark(found);
        // Precarga la nota ya guardada — es justo lo que fallaba: al
        // reabrir en la misma pantalla, el campo aparecia vacio y parecia
        // que la nota anterior se habia perdido, aunque si estaba guardada.
        if (found?.note) setNote(found.note);
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  };

  const close = () => setVisible(false);

  const submit = async (status: ScreenReviewStatus, noteValue?: string) => {
    setSaving(true);
    try {
      await screenReviewApi.mark(routeName, status, noteValue);
      setStep('saved');
      setTimeout(() => setVisible(false), 900);
    } catch (e) {
      setStep('menu');
    } finally {
      setSaving(false);
    }
  };

  const onSelect = (status: ScreenReviewStatus) => {
    if (status === 'delete') {
      submit(status);
      return;
    }
    setPendingStatus(status);
    setStep('note');
  };

  return (
    <>
      <TouchableOpacity
        style={s.fab}
        onPress={open}
        activeOpacity={0.85}
      >
        <Ionicons name="flag-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={close} />
        <View style={s.centerWrap} pointerEvents="box-none">
          <View style={s.card}>
            {step === 'menu' && (
              <>
                <Text style={s.title}>Revisar pantalla</Text>
                <Text style={s.routeName} numberOfLines={1}>
                  {routeName}
                </Text>
                {loadingExisting ? (
                  <ActivityIndicator size="small" color={C.textSecondary} style={{ marginBottom: 12 }} />
                ) : existingMark ? (
                  <View style={[s.existingBanner, { borderColor: STATUS_META[existingMark.status].color }]}>
                    <Text style={[s.existingBannerLabel, { color: STATUS_META[existingMark.status].color }]}>
                      Ya marcada: {STATUS_META[existingMark.status].label}
                    </Text>
                    {existingMark.note ? (
                      <Text style={s.existingBannerNote} numberOfLines={3}>
                        {existingMark.note}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                {(['delete', 'done', 'confused'] as ScreenReviewStatus[]).map((status) => {
                  const meta = STATUS_META[status];
                  return (
                    <TouchableOpacity key={status} style={s.optionRow} onPress={() => onSelect(status)} activeOpacity={0.75}>
                      <Ionicons name={meta.icon} size={20} color={meta.color} style={{ marginRight: 12 }} />
                      <Text style={[s.optionText, { color: meta.color }]}>{meta.label}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={s.cancelBtn} onPress={close}>
                  <Text style={s.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'note' && pendingStatus && (
              <>
                <Text style={s.title}>{STATUS_META[pendingStatus].label}</Text>
                <Text style={s.routeName} numberOfLines={1}>
                  {routeName}
                </Text>
                <TextInput
                  style={s.noteInput}
                  placeholder="Nota (opcional) — objetivo, instrucciones, qué falta..."
                  placeholderTextColor={C.textSecondary}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus={!existingMark?.note}
                />
                <View style={s.noteBtnRow}>
                  <TouchableOpacity style={s.noteCancelBtn} onPress={() => setStep('menu')} disabled={saving}>
                    <Text style={s.cancelBtnText}>Atrás</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.noteSaveBtn, { backgroundColor: STATUS_META[pendingStatus].color }]}
                    onPress={() => submit(pendingStatus, note.trim() || undefined)}
                    disabled={saving}
                  >
                    {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={s.noteSaveBtnText}>Guardar</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 'saved' && (
              <View style={s.savedWrap}>
                <Ionicons name="checkmark-circle" size={36} color={C.success60} />
                <Text style={s.savedText}>Guardado</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  centerWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, backgroundColor: C.surface, borderRadius: 20, padding: 20 },
  title: { fontFamily: FONT.bold, fontSize: 16, color: C.textPrimary, textAlign: 'center' },
  routeName: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  existingBanner: { borderWidth: 1.5, borderRadius: 12, padding: 10, marginBottom: 14 },
  existingBannerLabel: { fontFamily: FONT.bold, fontSize: 12 },
  existingBannerNote: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 4 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderTopWidth: 1, borderTopColor: C.border },
  optionText: { fontFamily: FONT.semiBold, fontSize: 14.5 },
  cancelBtn: { alignItems: 'center', paddingTop: 16 },
  cancelBtnText: { fontFamily: FONT.semiBold, fontSize: 13.5, color: C.textSecondary },
  noteInput: {
    backgroundColor: C.gray5,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: C.textPrimary,
  },
  noteBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  noteCancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 14, backgroundColor: C.gray5 },
  noteSaveBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 14 },
  noteSaveBtnText: { fontFamily: FONT.bold, fontSize: 14, color: '#FFFFFF' },
  savedWrap: { alignItems: 'center', paddingVertical: 12, gap: 8 },
  savedText: { fontFamily: FONT.semiBold, fontSize: 14, color: C.textPrimary },
});
