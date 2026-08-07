import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
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
export default function SimpleBottomSheet({ visible, onClose, children }: SimpleBottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>{children}</View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
  },
});
