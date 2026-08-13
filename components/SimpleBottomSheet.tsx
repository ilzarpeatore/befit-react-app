import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import { C } from '../pages/migrated/theme';

interface SimpleBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Sustituye a @gorhom/bottom-sheet: la app no tiene un BottomSheetModalProvider
// montado en la raiz (App.tsx), y el componente no-modal `BottomSheet` sin ese
// contexto llega a capturar los toques de toda la pantalla incluso cerrado
// (index=-1) — bloqueaba hasta el boton de "atras". Modal es el patron ya
// usado y probado en el resto de la app (ej. workout_session_screen.tsx).
//
// Teclado: el Modal en si no es "keyboard aware" — sin envolverlo, el
// teclado se solapa encima de la sheet y tapa botones como "Guardar" (bug
// reportado en Antropometria al añadir una métrica). Se envuelve todo
// (backdrop + sheet) en un KeyboardAvoidingView para que la sheet suba por
// encima del teclado. Además, el toque en el backdrop para cerrar la sheet
// ahora primero solo baja el teclado (si está abierto) — antes, tocar fuera
// del input cerraba la sheet entera de golpe, dejando al usuario sin ver el
// formulario para volver a intentarlo.
export default function SimpleBottomSheet({ visible, onClose, children }: SimpleBottomSheetProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
      setKeyboardVisible(false);
    };
  }, [visible]);

  const onBackdropPress = () => {
    if (keyboardVisible) {
      Keyboard.dismiss();
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onBackdropPress} />
        <View style={s.sheet}>{children}</View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  flexFill: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
  },
});
