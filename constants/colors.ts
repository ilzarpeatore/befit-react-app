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

  BORDER_START: "rgba(138,140,178,0.4)",
  BORDER_END: "rgba(138,140,178,0)",

  PINK_ACCENT: C.pink,
  SUCCESS: C.success,
  DANGER: C.destructive,

  CARD_START: "#5A5D87",
  CARD_END: "#3C3F69",
} as const;
