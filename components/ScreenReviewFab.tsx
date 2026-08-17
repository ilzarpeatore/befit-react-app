import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Icon } from '@components/ui/icon';
import { Fab } from '@components/ui/fab';
import { Pressable } from '@components/ui/pressable';
import { Textarea, TextareaInput } from '@components/ui/textarea';
import { Modal, ModalBackdrop, ModalContent } from '@components/ui/modal';
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
      <Fab
        onPress={open}
        className="right-2 rounded-full"
        style={{ top: '50%', marginTop: -22, width: 44, height: 44, backgroundColor: '#3A3A3C' }}
      >
        <Icon name="flag-outline" size={20} color="#FFFFFF" />
      </Fab>

      <Modal isOpen={visible} onClose={close} avoidKeyboard>
        <ModalBackdrop />
        <ModalContent
          className="items-stretch"
          style={{ backgroundColor: C.surface, borderRadius: 20, padding: 20, maxWidth: 360, width: '100%' }}
        >
          {step === 'menu' && (
            <>
              <Text weight="bold" className="text-center text-foreground" style={{ fontSize: 16 }}>
                Revisar pantalla
              </Text>
              <Text muted className="text-center" style={{ fontSize: 12, marginTop: 4, marginBottom: 16 }} numberOfLines={1}>
                {routeName}
              </Text>
              {loadingExisting ? (
                <ActivityIndicator size="small" color={C.textSecondary} style={{ marginBottom: 12 }} />
              ) : existingMark ? (
                <Box
                  className="rounded-md"
                  style={{ borderWidth: 1.5, padding: 10, marginBottom: 14, borderColor: STATUS_META[existingMark.status].color }}
                >
                  <Text weight="bold" style={{ fontSize: 12, color: STATUS_META[existingMark.status].color }}>
                    Ya marcada: {STATUS_META[existingMark.status].label}
                  </Text>
                  {existingMark.note ? (
                    <Text muted style={{ fontSize: 12, marginTop: 4 }} numberOfLines={3}>
                      {existingMark.note}
                    </Text>
                  ) : null}
                </Box>
              ) : null}
              {(['delete', 'done', 'confused'] as ScreenReviewStatus[]).map((status) => {
                const meta = STATUS_META[status];
                return (
                  <Pressable
                    key={status}
                    className="flex-row items-center border-t border-border"
                    style={{ paddingVertical: 13 }}
                    onPress={() => onSelect(status)}
                  >
                    <Icon name={meta.icon} size={20} color={meta.color} style={{ marginRight: 12 }} />
                    <Text weight="semibold" style={{ fontSize: 14.5, color: meta.color }}>{meta.label}</Text>
                  </Pressable>
                );
              })}
              <Pressable className="items-center" style={{ paddingTop: 16 }} onPress={close}>
                <Text weight="semibold" muted style={{ fontSize: 13.5 }}>Cancelar</Text>
              </Pressable>
            </>
          )}

          {step === 'note' && pendingStatus && (
            <>
              <Text weight="bold" className="text-center text-foreground" style={{ fontSize: 16 }}>
                {STATUS_META[pendingStatus].label}
              </Text>
              <Text muted className="text-center" style={{ fontSize: 12, marginTop: 4, marginBottom: 16 }} numberOfLines={1}>
                {routeName}
              </Text>
              <Textarea className="border-0 bg-card" style={{ borderRadius: 12, minHeight: 90 }}>
                <TextareaInput
                  placeholder="Nota (opcional) — objetivo, instrucciones, qué falta..."
                  style={{ fontFamily: FONT.regular, fontSize: 13.5 }}
                  value={note}
                  onChangeText={setNote}
                  autoFocus={!existingMark?.note}
                />
              </Textarea>
              <Box className="flex-row" style={{ gap: 10, marginTop: 16 }}>
                <Pressable
                  className="flex-1 items-center justify-center rounded-md bg-card"
                  style={{ paddingVertical: 13 }}
                  onPress={() => setStep('menu')}
                  disabled={saving}
                >
                  <Text weight="semibold" muted style={{ fontSize: 13.5 }}>Atrás</Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center justify-center rounded-md"
                  style={{ paddingVertical: 13, backgroundColor: STATUS_META[pendingStatus].color }}
                  onPress={() => submit(pendingStatus, note.trim() || undefined)}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text weight="bold" style={{ fontSize: 14, color: '#FFFFFF' }}>Guardar</Text>
                  )}
                </Pressable>
              </Box>
            </>
          )}

          {step === 'saved' && (
            <Box className="items-center" style={{ paddingVertical: 12, gap: 8 }}>
              <Icon name="checkmark-circle" size={36} color={C.success60} />
              <Text weight="semibold" className="text-foreground" style={{ fontSize: 14 }}>Guardado</Text>
            </Box>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
