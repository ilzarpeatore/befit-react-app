'use client';
import { GlassView as ExpoGlassView } from 'expo-glass-effect';
import { styled } from 'nativewind';

// GlassView de expo-glass-effect no es un componente RN "core" que NativeWind
// reconozca de fábrica (como View/Text/Pressable) — hay que envolverlo con
// styled() para que className se resuelva a style, mismo motivo ya
// documentado en components/ui/icon/index.tsx para Ionicons.
//
// Renderiza el material Liquid Glass real solo en iOS 26+ compilado con
// Xcode 26+ (nuestro workflow de CI usa `xcode-version: latest-stable`, así
// que esto se resuelve solo). En cualquier otra plataforma/versión,
// expo-glass-effect ya cae a una <View> normal por su cuenta — no hace
// falta ninguna rama condicional aquí, es seguro usarlo siempre.
// @ts-ignore — límite de complejidad estructural de TS al envolver un
// componente nativo custom con styled() (TS2590), no afecta al runtime.
const GlassView = styled(ExpoGlassView, { className: 'style' });

export { GlassView };
export { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
export type { GlassEffectStyleConfig, GlassStyle, GlassViewProps } from 'expo-glass-effect';
