'use client';
import React from 'react';
import { Box } from '@components/ui/box';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import { GlassView, isGlassEffectAPIAvailable, type GlassStyle } from '@components/ui/glass-view';

const SIDE_SLOT_WIDTH = 40;

interface ScreenHeaderProps {
  title: string;
  /** Omitido en pantallas raiz sin boton de volver (ej. tabs) -- usar hideBack en su lugar. */
  onBack?: () => void;
  hideBack?: boolean;
  /** Slot opcional a la derecha (accion/icono). Sin el, un spacer del mismo
   * ancho que el boton de volver mantiene el titulo centrado de verdad --
   * antes cada pantalla lo hacia a mano y de forma inconsistente (unas
   * centradas, otras no, con tamanos de fuente distintos). */
  rightAction?: React.ReactNode;
  glassEffectStyle?: GlassStyle;
}

// Cabecera compartida (Fase 4 del rollout de Liquid Glass) -- reemplaza el
// patron repetido a mano en pages/migrated/* (Box/HStack + Button/Pressable +
// Heading, cada pantalla con su propio padding/alineacion). Mismo criterio
// que Card/SimpleBottomSheet: GlassView real en iOS 26+, fondo solido
// bg-card como fallback en Android/iOS<26. No gestiona el safe-area top --
// se monta como primer hijo dentro del SafeAreaView de cada pantalla, que ya
// lo cubre.
export default function ScreenHeader({ title, onBack, hideBack, rightAction, glassEffectStyle = 'regular' }: ScreenHeaderProps) {
  const hasGlass = isGlassEffectAPIAvailable();

  const content = (
    <Box className="flex-row items-center justify-between px-4" style={{ paddingVertical: 12 }}>
      {hideBack ? (
        <Box style={{ width: SIDE_SLOT_WIDTH }} />
      ) : (
        <Button variant="ghost" size="icon" onPress={onBack} style={{ width: SIDE_SLOT_WIDTH }}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
      )}
      <Heading size="sm" className="flex-1 text-center" numberOfLines={1} style={{ marginHorizontal: 8 }}>
        {title}
      </Heading>
      {rightAction ?? <Box style={{ width: SIDE_SLOT_WIDTH }} />}
    </Box>
  );

  if (hasGlass) {
    return (
      <GlassView glassEffectStyle={glassEffectStyle} style={{ width: '100%' }}>
        {content}
      </GlassView>
    );
  }
  return <Box className="bg-card w-full">{content}</Box>;
}
