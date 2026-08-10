// Traduccion entre nuestros nombres de grupo muscular (los 18 body_parts +
// los 21 grupos canonicos usados por el reparto EMG del backend) y los ids
// ingles de los paths de bodyMusclesPaths.ts (70+ regiones, lado izq/der
// separado). Espejo exacto de src/lib/body-muscles-map.ts del admin panel —
// si cambia uno, cambiar el otro. Ver ese archivo para el razonamiento
// completo de cada mapeo.
export const CANONICAL_TO_BODY_MUSCLES: Record<string, string[]> = {
  'Pecho': ['chest-upper-left', 'chest-upper-right', 'chest-lower-left', 'chest-lower-right'],
  'Espalda': [
    'lats-upper-left', 'lats-mid-left', 'lats-lower-left',
    'lats-upper-right', 'lats-mid-right', 'lats-lower-right',
    'traps-upper-left', 'traps-mid-left', 'traps-lower-left',
    'traps-upper-right', 'traps-mid-right', 'traps-lower-right',
  ],
  'Hombros': [
    'shoulder-front-left', 'shoulder-front-right',
    'shoulder-side-left', 'shoulder-side-right',
    'deltoid-rear-left', 'deltoid-rear-right',
  ],
  'Bíceps': ['biceps-left', 'biceps-right'],
  'Tríceps': ['triceps-long-left', 'triceps-lateral-left', 'triceps-long-right', 'triceps-lateral-right'],
  'Cuádriceps': ['quads-left', 'quads-right'],
  'Femorales': ['hamstrings-medial-left', 'hamstrings-lateral-left', 'hamstrings-medial-right', 'hamstrings-lateral-right'],
  'Glúteos': ['gluteus-medius-left', 'gluteus-maximus-left', 'gluteus-medius-right', 'gluteus-maximus-right'],
  'Abdominales': ['abs-upper-left', 'abs-upper-right', 'abs-lower-left', 'abs-lower-right'],
  'Gemelos': [
    'calves-gastroc-medial-left', 'calves-gastroc-lateral-left', 'calves-soleus-left',
    'calves-gastroc-medial-right', 'calves-gastroc-lateral-right', 'calves-soleus-right',
  ],
  'Antebrazos': [
    'forearm-left', 'forearm-right',
    'forearm-flexors-left', 'forearm-extensors-left',
    'forearm-flexors-right', 'forearm-extensors-right',
  ],
  'Trapecios': ['traps-upper-left', 'traps-mid-left', 'traps-lower-left', 'traps-upper-right', 'traps-mid-right', 'traps-lower-right'],
  'Cuello': ['neck-left', 'neck-right', 'nape', 'head-back'],
  'Brazos superiores': [
    'biceps-left', 'biceps-right',
    'triceps-long-left', 'triceps-lateral-left', 'triceps-long-right', 'triceps-lateral-right',
  ],
  'Piernas inferiores': [
    'tibialis-anterior-left', 'tibialis-anterior-right',
    'calves-gastroc-medial-left', 'calves-gastroc-lateral-left', 'calves-soleus-left',
    'calves-gastroc-medial-right', 'calves-gastroc-lateral-right', 'calves-soleus-right',
  ],
  'Piernas superiores': [
    'quads-left', 'quads-right',
    'hamstrings-medial-left', 'hamstrings-lateral-left', 'hamstrings-medial-right', 'hamstrings-lateral-right',
    'adductors-left', 'adductors-right',
  ],
  'Cintura': ['abs-lower-left', 'abs-lower-right', 'obliques-left', 'obliques-right'],
  // 'Full Body' deliberadamente sin mapeo.

  'Antebrazo': [
    'forearm-left', 'forearm-right',
    'forearm-flexors-left', 'forearm-extensors-left',
    'forearm-flexors-right', 'forearm-extensors-right',
  ],
  'Deltoides lateral': ['shoulder-side-left', 'shoulder-side-right'],
  'Deltoides frontal': ['shoulder-front-left', 'shoulder-front-right'],
  'Deltoides anterior': ['shoulder-front-left', 'shoulder-front-right'],
  'Deltoides posterior': ['deltoid-rear-left', 'deltoid-rear-right'],
  'Espalda alta': ['traps-upper-left', 'traps-upper-right', 'lats-upper-left', 'lats-upper-right'],
  'Dorsales': ['lats-upper-left', 'lats-mid-left', 'lats-lower-left', 'lats-upper-right', 'lats-mid-right', 'lats-lower-right'],
  'Lumbar': ['lower-back-erectors-left', 'lower-back-ql-left', 'lower-back-erectors-right', 'lower-back-ql-right', 'spine'],
  'Oblicuos': ['obliques-left', 'obliques-right'],
  'Isquiotibiales': ['hamstrings-medial-left', 'hamstrings-lateral-left', 'hamstrings-medial-right', 'hamstrings-lateral-right'],
  'Gluteo': ['gluteus-medius-left', 'gluteus-maximus-left', 'gluteus-medius-right', 'gluteus-maximus-right'],
  'Gluteo mayor': ['gluteus-maximus-left', 'gluteus-maximus-right'],
  'Gluteo medio': ['gluteus-medius-left', 'gluteus-medius-right'],
  'Gluteo menor': ['gluteus-medius-left', 'gluteus-medius-right'],
};

// body_parts.id (18 filas reales de la BD) -> nombre canonico, para poder
// resolver desde el id numerico que guarda `exercises.bodypart_ids` sin
// tener que llamar al backend. Mismo orden/valores que la tabla `body_parts`
// sembrada en el proyecto — si se añaden/renombran filas ahi, actualizar aqui.
export const BODY_PART_ID_TO_NAME: Record<number, string> = {
  1: 'Pecho',
  2: 'Espalda',
  3: 'Hombros',
  4: 'Bíceps',
  5: 'Tríceps',
  6: 'Cuádriceps',
  7: 'Femorales',
  8: 'Glúteos',
  9: 'Abdominales',
  10: 'Gemelos',
  11: 'Antebrazos',
  12: 'Trapecios',
  13: 'Full Body',
  14: 'Cuello',
  15: 'Brazos superiores',
  16: 'Piernas inferiores',
  17: 'Piernas superiores',
  18: 'Cintura',
};

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const NORMALIZED_MAP = new Map<string, string[]>(
  Object.entries(CANONICAL_TO_BODY_MUSCLES).map(([k, v]) => [normalize(k), v])
);

/** Ids de bodyMusclesPaths.ts a resaltar para un nombre de grupo canonico dado. */
export function bodyMusclesIdsFor(canonicalGroup: string): string[] {
  return NORMALIZED_MAP.get(normalize(canonicalGroup)) ?? [];
}

/** Ids de bodyMusclesPaths.ts a resaltar para un body_part.id de la BD. */
export function bodyMusclesIdsForBodyPartId(bodyPartId: number): string[] {
  const name = BODY_PART_ID_TO_NAME[bodyPartId];
  return name ? bodyMusclesIdsFor(name) : [];
}

// Inverso: de un muscle-id de bodyMusclesPaths.ts a un body_parts.id real —
// usado en el buscador de ejercicios (tap en el mapa -> filtra por bodypart).
// Un muscle-id puede pertenecer a varios grupos canonicos (ej. biceps-left
// esta en "Bíceps" y en "Brazos superiores") — se prioriza el body_part MAS
// especifico (no genericos como "Brazos superiores"/"Piernas..."/"Full Body").
const GENERIC_BODY_PART_NAMES = new Set(['Full Body', 'Brazos superiores', 'Piernas inferiores', 'Piernas superiores', 'Cintura']);

const MUSCLE_ID_TO_BODY_PART_ID = (() => {
  const map = new Map<string, number>();
  const specificFirst = Object.entries(BODY_PART_ID_TO_NAME).sort(([, a], [, b]) => {
    const aGeneric = GENERIC_BODY_PART_NAMES.has(a) ? 1 : 0;
    const bGeneric = GENERIC_BODY_PART_NAMES.has(b) ? 1 : 0;
    return aGeneric - bGeneric;
  });
  for (const [idStr, name] of specificFirst) {
    const id = Number(idStr);
    for (const muscleId of bodyMusclesIdsFor(name)) {
      if (!map.has(muscleId)) map.set(muscleId, id);
    }
  }
  return map;
})();

/** body_parts.id correspondiente a un muscle-id tocado en el mapa (o null si no hay uno claro). */
export function bodyPartIdForMuscle(muscleId: string): number | null {
  return MUSCLE_ID_TO_BODY_PART_ID.get(muscleId) ?? null;
}

// Los 6 ejes del radar de "Distribución de los músculos" (Pantallas_Estadisticas.md
// sección 3) — agrupan los 21 grupos canonicos de MuscleVolumeService::DEFAULT_MUSCLE_GROUPS
// (los mismos que devuelve /my-muscle-volume en volumeByMuscle) en las 6 macro-zonas
// que usa Hevy, para poder comparar visualmente sin 21 ejes ilegibles.
export const MACRO_MUSCLE_GROUPS = ['Espalda', 'Pecho', 'Piernas', 'Core', 'Brazos', 'Hombros'] as const;
export type MacroMuscleGroup = (typeof MACRO_MUSCLE_GROUPS)[number];

const CANONICAL_TO_MACRO: Record<string, MacroMuscleGroup> = {
  'Pecho': 'Pecho',
  'Bíceps': 'Brazos',
  'Tríceps': 'Brazos',
  'Antebrazo': 'Brazos',
  'Trapecios': 'Espalda',
  'Hombros': 'Hombros',
  'Deltoides lateral': 'Hombros',
  'Deltoides frontal': 'Hombros',
  'Deltoides posterior': 'Hombros',
  'Espalda alta': 'Espalda',
  'Dorsales': 'Espalda',
  'Lumbar': 'Espalda',
  'Abdominales': 'Core',
  'Oblicuos': 'Core',
  'Cuádriceps': 'Piernas',
  'Isquiotibiales': 'Piernas',
  'Gluteo': 'Piernas',
  'Gluteo medio': 'Piernas',
  'Gluteo mayor': 'Piernas',
  'Gluteo menor': 'Piernas',
  'Gemelos': 'Piernas',

  // Nombres reales de body_parts (BODY_PART_ID_TO_NAME arriba) — el grupo
  // "primario" que resuelve MuscleVolumeService puede ser cualquiera de los
  // 18 body_parts de la BD, no solo los ~21 nombres canonicos del reparto
  // EMG (ver resolvePrimaryGroups en el backend). Sin estas entradas esos
  // grupos se perdian del todo al agrupar por macro-zona (ej. "Piernas
  // superiores" o "Glúteos" aparecian sueltos en vez de sumarse a "Piernas").
  'Espalda': 'Espalda',
  'Glúteos': 'Piernas',
  'Femorales': 'Piernas',
  'Antebrazos': 'Brazos',
  'Brazos superiores': 'Brazos',
  'Piernas superiores': 'Piernas',
  'Piernas inferiores': 'Piernas',
  'Cintura': 'Core',
  // Añadidos 2026-08-09: 4 body_parts reales de la BD (ids 22/24/25/26) que
  // faltaban aquí por completo - un ejercicio cuyo bodypart primario fuera
  // cualquiera de estos (ej. aductores/abductores en máquina, o cualquiera
  // con "Core" literal) quedaba con macroGroupFor()===null y desaparecía
  // sin más del radar de distribución y del recuento de series por zona,
  // aunque el ejercicio sí se hubiera registrado. Ver body_parts.title en BD.
  'Core': 'Core',
  'Aductores': 'Piernas',
  'Abductores': 'Piernas',
  'Tibial anterior': 'Piernas',
  // 'Full Body' y 'Cuello' deliberadamente sin mapeo — no encajan en un eje.
};

const NORMALIZED_MACRO_MAP = new Map<string, MacroMuscleGroup>(
  Object.entries(CANONICAL_TO_MACRO).map(([k, v]) => [normalize(k), v])
);

/** Macro-zona (uno de los 6 ejes del radar) para un grupo canonico dado, o null si no se reconoce. */
export function macroGroupFor(canonicalGroup: string): MacroMuscleGroup | null {
  return NORMALIZED_MACRO_MAP.get(normalize(canonicalGroup)) ?? null;
}
