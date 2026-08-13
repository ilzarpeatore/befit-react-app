import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Set de iconos de hábitos — misma `key` semántica que el admin panel
 * (src/lib/habitIcons.ts), cada lado la traduce a su propia librería
 * (Ionicons aquí, lucide-react en el admin). El backend solo guarda la
 * key, nunca un nombre de icono atado a una plataforma concreta.
 */
export const HABIT_ICON_MAP: Record<string, IoniconName> = {
  water: 'water-outline',
  steps: 'walk-outline',
  sleep: 'bed-outline',
  meditate: 'leaf-outline',
  read: 'book-outline',
  workout: 'barbell-outline',
  bike: 'bicycle-outline',
  nutrition: 'nutrition-outline',
  sun: 'sunny-outline',
  coffee: 'cafe-outline',
  timer: 'timer-outline',
  fire: 'flame-outline',
  mood: 'happy-outline',
  phone: 'phone-portrait-outline',
  social: 'people-outline',
  health: 'medical-outline',
  fitness: 'fitness-outline',
  meal: 'restaurant-outline',
  journal: 'pencil-outline',
  home: 'home-outline',
  moon: 'moon-outline',
  heart: 'heart-outline',
  cold: 'snow-outline',
};

export const HABIT_ICON_KEYS = Object.keys(HABIT_ICON_MAP);

export function habitIoniconFor(key: string | null | undefined): IoniconName {
  return (key && HABIT_ICON_MAP[key]) || 'sparkles-outline';
}
