// Theme claro estilo Bevel (Encargo 2, 2026-07-31). Migrado desde la paleta
// oscura original — se mantienen los mismos nombres de clave para que las
// 173 pantallas existentes seguuan funcionando sin tocarlas, solo cambian
// los valores. Ver docs/Encargo2_Theme_Bevel.md para el origen de estos
// valores (estimados visualmente de 18 capturas reales de Bevel).
// Encargo 3 (2026-07-31): paleta monocromática — fondo gris claro (#EBEBF0),
// superficies blancas (#FFFFFF), texto en grises/negros (#000000), acento de
// marca en gris claro (#E5E5EA) para mantener el patrón relleno claro +
// texto oscuro. El fondo NO es blanco puro para que las tarjetas blancas
// sigan destacando (jerarquía visual).
export const C = {
  bg: "#EBEBF0",
  surface: "#FFFFFF",
  surfaceLight: "#FFFFFF",
  border: "#E5E5EA",
  white: "#000000",
  gray5: "#F7F7F7",
  gray10: "#E5E5EA",
  gray20: "#D1D1D6",
  gray30: "#AEAEB2",
  gray40: "#8A8A90",
  gray50: "#6B6B70",
  gray60: "#3A3A3C",
  gray70: "#E5E5EA",
  gray80: "#E5E5EA",
  brand5: "rgba(0,0,0,0.08)",
  brand10: "rgba(0,0,0,0.15)",
  brand20: "rgba(0,0,0,0.25)",
  brand50: "#E5E5EA",
  brand60: "#E5E5EA",
  success: "#34C759",
  success5: "rgba(52,199,89,0.1)",
  success10: "rgba(52,199,89,0.15)",
  success50: "#34C759",
  success60: "#248A3D",
  warning: "#FF9500",
  warning5: "rgba(255,149,0,0.1)",
  warning10: "rgba(255,149,0,0.15)",
  warning40: "#FF9500",
  warning50: "#FF9500",
  warning60: "#C93400",
  destructive: "#FF3B30",
  destructive5: "rgba(255,59,48,0.1)",
  destructive10: "rgba(255,59,48,0.15)",
  destructive20: "rgba(255,59,48,0.25)",
  destructive50: "#FF3B30",
  destructive60: "#D70015",
  blue: "#007AFF",
  blue5: "rgba(0,122,255,0.1)",
  blue10: "rgba(0,122,255,0.15)",
  blue20: "rgba(0,122,255,0.25)",
  blue50: "#007AFF",
  blue60: "#0062CC",
  blue70: "#004999",
  purple: "#A78BFA",
  purple5: "rgba(167,139,250,0.1)",
  purple50: "#A78BFA",
  purple60: "#8B5CF6",
  orange: "#FF6B35",
  orangeGradient1: "#FF8A2B",
  orangeGradient2: "#FF6000",
  amber: "#FF9500",
  blue80: "#003166",
  blue30: "#66B2FF",
  red: "#FF3B30",
  pink: "#FB558B",
  textWhite: "#000000",
  textPrimary: "#000000",
  textSecondary: "#6B6B70",
  textTertiary: "#AEAEB2",
  primary: "#E5E5EA",
  primaryLight: "rgba(0,0,0,0.15)",
  gray: "#6B6B70",
  text: "#000000",
  card: "#FFFFFF",
  textMuted: "#AEAEB2",

  // Tokens semánticos con nombre (sección 1 del Encargo 2) — reutilizar
  // estos por significado, en vez de success/warning/destructive/blue
  // sueltos, para pantallas nuevas que sigan el patrón de color de Bevel.
  statusSuccess: "#34C759",
  statusWarning: "#FF9500",
  statusDanger: "#FF3B30",
  statusInfo: "#007AFF",
  statusRest: "#FFCC00",
  statusCycle: "#FFD1DC",

  // Acento neutro para CTAs principales tipo Bevel (botones "Continuar",
  // "Guardar") — negro casi puro, no el brand50/60 morado de la app.
  accentBlack: "#000000",
} as const;

export const FONT = {
  light: "Gilroy-Light",
  regular: "Gilroy-Regular",
  medium: "Gilroy-Medium",
  semiBold: "Gilroy-SemiBold",
  bold: "Gilroy-Bold",
  extraBold: "Gilroy-ExtraBold",
  black: "Gilroy-Black",
};

export const GRADIENT = {
  accent: ["#E5E5EA", "#E5E5EA"] as const,
  card: ["#FFFFFF", "#F7F7F7"] as const,
  orange: ["#FF8A2B", "#FF6000"] as const,
  border: ["rgba(0,0,0,0.08)", "rgba(0,0,0,0)"] as const,
};

// Tokens de espaciado y forma (sección 0.2 del Encargo 2).
export const RADIUS = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

export const SPACING = {
  cardPadding: 20,
  screenPadding: 16,
  gapBetweenCards: 12,
  gapBetweenSections: 28,
} as const;

export const SHADOW = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
} as const;

// Tipografía estimada (sección 0.3 del Encargo 2).
export const TYPE = {
  screenTitle: { fontSize: 32, fontWeight: "700" as const },
  sectionTitle: { fontSize: 22, fontWeight: "700" as const },
  cardTitle: { fontSize: 17, fontWeight: "600" as const },
  bodyText: { fontSize: 15, fontWeight: "400" as const },
  label: { fontSize: 13, fontWeight: "500" as const, color: C.textSecondary },
  ringValueLarge: { fontSize: 48, fontWeight: "700" as const },
  ringLabel: { fontSize: 15, fontWeight: "500" as const },
} as const;
