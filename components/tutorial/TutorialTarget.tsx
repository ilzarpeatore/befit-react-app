import React, { useCallback, useRef } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTutorial } from '@store/TutorialContext';

interface Props {
  id: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Envuelve cualquier elemento que un reto del tutorial pueda señalar.
// Se mide (measureInWindow, coordenadas absolutas de pantalla, lo que
// necesita el overlay para recortar el hueco) cada vez que la pantalla
// gana el foco -- no basta con onLayout solo, porque react-native-screens
// mantiene la pantalla montada al navegar hacia atrás, así que onLayout no
// vuelve a dispararse al reenfocar si el tamaño no cambió.
export default function TutorialTarget({ id, children, style }: Props) {
  const ref = useRef<View>(null);
  const { registerTarget, unregisterTarget } = useTutorial();

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) registerTarget(id, { x, y, width, height });
    });
  }, [id, registerTarget]);

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(measure, 80);
      return () => {
        clearTimeout(timeout);
        unregisterTarget(id);
      };
    }, [measure, unregisterTarget, id])
  );

  return (
    <View ref={ref} onLayout={measure} style={style} collapsable={false}>
      {children}
    </View>
  );
}
