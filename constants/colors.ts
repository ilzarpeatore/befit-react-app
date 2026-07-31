import { C } from '../pages/migrated/theme';

export const Colors = {
  BG_PRIMARY: C.bg,
  BG_INPUT: C.surface,
  BG_CARD: C.surfaceLight,

  ACCENT_START: C.brand50,
  ACCENT_END: C.brand60,
  ACCENT_ACTIVE: C.brand60,

  TEXT_PRIMARY: C.white,
  TEXT_SECONDARY: C.textSecondary,
  TEXT_MUTED: C.textMuted,

  // Hex sueltos, no pasan por C - no se tocaron en la migracion a theme claro
  // (Encargo 2) hasta ahora. Actualizados para que DietCard (unico consumidor)
  // tenga un fondo real claro en vez de quedar oscuro con texto oscuro encima.
  BORDER_START: "rgba(0,0,0,0.08)",
  BORDER_END: "rgba(0,0,0,0)",

  PINK_ACCENT: C.pink,
  SUCCESS: C.success,
  DANGER: C.destructive,

  CARD_START: "#FFFFFF",
  CARD_END: "#FFFFFF",
} as const;
