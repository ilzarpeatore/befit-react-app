import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent } from '@components/ui/actionsheet';
import { C } from '../pages/migrated/theme';

interface SimpleBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Envuelve el Actionsheet real de Gluestack (verificado: usa el mismo Overlay
// portal-based que Modal, montado en App.tsx vía GluestackUIProvider, y se
// desmonta del todo cuando está cerrado — `if (!isOpen && exited) return null`
// en @gluestack-ui/core — no es el bug de @gorhom/bottom-sheet que motivó
// este componente en primer lugar, ese SÍ dejaba una capa invisible
// capturando toques con index=-1).
//
// Se conserva a propósito, encima del Actionsheet real, lo que Gluestack no
// trae de fábrica: el toque en el backdrop primero baja el teclado (si está
// abierto) y solo cierra la hoja en un segundo toque — mismo fix ya probado
// en producción (Antropometría), ActionsheetBackdrop no lo replica solo.
// `onPress` propio sustituye por completo el auto-cierre interno del
// Backdrop (createActionsheet lo spreadea después de su handler default),
// así que el control de apertura/cierre sigue siendo 100% el `visible`/
// `onClose` de este wrapper, igual que antes.
//
// El `className` por defecto de ActionsheetContent trae padding/centrado
// pensados para listas de opciones (`p-2 items-center`) que no encajan con
// los formularios/listas de ancho completo que usan las 13 pantallas que
// consumen este componente — se sobreescribe con `style` para reproducir
// exactamente el aspecto anterior (mismo radio, mismo color, mismo padding).
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
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop onPress={onBackdropPress} />
      <ActionsheetContent
        className="items-stretch p-0"
        style={{
          backgroundColor: C.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: 28,
        }}
      >
        <KeyboardAvoidingView
          style={{ width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {children}
        </KeyboardAvoidingView>
      </ActionsheetContent>
    </Actionsheet>
  );
}
