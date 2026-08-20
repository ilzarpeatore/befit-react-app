export interface HabitLogLike {
  date: string;
  is_completed: boolean;
}

/** 7 booleanos (Lunes..Domingo de la semana en curso) a partir de un array de logs con fecha + is_completed. */
export function computeWeekCompliance(logs: HabitLogLike[]): boolean[] {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));

  const completedDates = logs.reduce((set, l) => {
    if (l.is_completed) set.add(l.date.slice(0, 10));
    return set;
  }, new Set<string>());

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return completedDates.has(d.toISOString().slice(0, 10));
  });
}
