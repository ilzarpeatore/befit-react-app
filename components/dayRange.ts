import type { DaySelectorItem } from './DaySelectorStrip';

const SPANISH_DAY_LETTERS = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S']; // getDay(): 0=domingo..6=sabado

/**
 * Formatea a YYYY-MM-DD usando el calendario LOCAL del dispositivo — nunca
 * `.toISOString()`, que convierte a UTC: tras un `setHours(0,0,0,0)` local,
 * en cualquier huso con offset positivo (ej. España, UTC+1/+2) la medianoche
 * local cae en la tarde/noche del día UTC anterior, así que
 * `toISOString().slice(0,10)` devolvía sistemáticamente el día de ayer.
 */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Construye los DaySelectorItem para los `count` días terminando en `endDate` (o hoy). */
export function buildDayRange(count: number, endDate?: Date): DaySelectorItem[] {
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(0, 0, 0, 0);
  const items: DaySelectorItem[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    items.push({
      date: toLocalISODate(d),
      dayLetter: SPANISH_DAY_LETTERS[d.getDay()],
      dayNumber: String(d.getDate()),
    });
  }
  return items;
}

/** Construye los 7 DaySelectorItem (lunes-domingo) de la semana que contiene `anyDateInWeek`. */
export function buildWeekRange(anyDateInWeek: Date): DaySelectorItem[] {
  const d = new Date(anyDateInWeek);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=domingo
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  return buildDayRange(7, new Date(monday.getTime() + 6 * 86400000));
}
