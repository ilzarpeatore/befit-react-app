// Mismo verde que C.success50 (#34C759) — se usa como base del degradado
// para que "completado al 100%" se vea idéntico al color que ya se usaba
// antes para hábitos binarios (Hacer la cama, etc.), sin romper nada visual.
const PROGRESS_RGB = '52,199,89';

/**
 * % del objetivo alcanzado ese día (0..1+). null = hábito binario (sin
 * target_value numérico, tipo "Hacer la cama") — esos siguen pintándose
 * solo hecho/no-hecho, sin degradado.
 */
export function habitProgressRatio(
  valueLogged: number | string | null | undefined,
  targetValue: number | string | null | undefined
): number | null {
  if (targetValue === null || targetValue === undefined) return null;
  const target = Number(targetValue);
  if (!target || Number.isNaN(target)) return null;
  const value = valueLogged === null || valueLogged === undefined ? 0 : Number(valueLogged);
  if (Number.isNaN(value)) return 0;
  return Math.max(0, value / target);
}

/**
 * Color de celda según % de cumplimiento — 5 tonos de intensidad creciente
 * (estilo GitHub contribution graph) sobre el mismo verde de "completado",
 * en vez de solo hecho/no-hecho. Debe coincidir exactamente con
 * src/lib/habitColor.ts del admin panel para que ambos lados se vean igual.
 */
export function habitCellColor(ratio: number | null, isCompleted: boolean, emptyColor: string): string {
  if (ratio === null) {
    return isCompleted ? `rgb(${PROGRESS_RGB})` : emptyColor;
  }
  if (ratio >= 1) return `rgb(${PROGRESS_RGB})`;
  if (ratio <= 0) return emptyColor;
  const alpha = ratio < 0.25 ? 0.25 : ratio < 0.5 ? 0.45 : ratio < 0.75 ? 0.65 : 0.85;
  return `rgba(${PROGRESS_RGB},${alpha})`;
}
