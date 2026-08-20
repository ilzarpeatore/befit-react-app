# Sesión de trabajo — Herramientas de desarrollo y caza de errores con react-doctor

> Repositorio: `ilzarpeatore/befit-react-app`
> Rama: `claude/setup-screen-navigator-dxvcj1`
> Fecha: 20 de agosto de 2026
> Este documento es un resumen informativo para que futuras sesiones de Claude Code (u otros
> desarrolladores) entiendan qué se hizo en esta sesión, por qué, y qué queda pendiente. No sustituye
> al historial de git — los commits mencionados abajo son la fuente de verdad.

## Resumen

Se completaron tres tareas encadenadas:

1. Instalación de un navegador de pantallas basado en expo-map.
2. Instalación de graft, un grafo de contexto de código consultable para agentes.
3. Instalación de react-doctor, caza y corrección de errores en toda la app, con 4 agentes trabajando
   en paralelo sobre worktrees aislados.

Resultado del escaneo react-doctor: **727 issues (33 errores) → 242 issues (0 errores)**, sobre 165
ficheros afectados.

---

## 1. Navegador de pantallas (expo-map)

Fuente: `github.com/aleqsio/expo-map`

expo-map está construido sobre `expo-router`, y este proyecto usa `react-navigation` con registro de
pantallas en línea vía `React.lazy()` dentro de `App.tsx` — el paquete tal cual no tenía nada que
analizar.

**Solución:** se vendorizó el analizador/renderizador de expo-map y se escribió un generador de
manifiesto a medida que lee el árbol de registro de `App.tsx` en lugar del sistema de archivos de
`expo-router`.

**Entregables:**

- `.expo-map/map.html` — mapa navegable de todas las pantallas de la app.
- `tools/expo-map/` — generador de manifiesto y utilidades vendorizadas, reutilizable cada vez que se
  añadan pantallas nuevas.

**Commit:** `95e631b`

---

## 2. Grafo de contexto (graft)

Fuente: `github.com/nanonets/graft`

graft construye un grafo de código consultable (`graft ask`, `graft grep`, `graft callers`) para que
los agentes ubiquen código exacto por `archivo:línea` sin tener que leer o grepear el repo entero cada
vez. Se instaló con:

```
graft build
graft init --agents claude
```

**Bug autoinfligido detectado y corregido:** el patrón `graft/` en `.gitignore` no estaba anclado, así
que también ocultaba `.claude/skills/graft/` — el propio skill que graft acababa de instalar quedaba
invisible para git. Se corrigió el patrón antes de confirmar.

**Commit:** `446078b`

Cualquier sesión de Claude Code en este repo debería preferir `graft ask "<tarea>"` / `graft grep` /
`graft callers` antes de grepear o leer archivos a ciegas — ver `.claude/skills/graft/SKILL.md`.

---

## 3. Caza de errores con react-doctor

Fuente: `github.com/millionco/react-doctor`

Tarea dominante de la sesión. Escaneo inicial: **727 issues, 33 de ellos errores bloqueantes**.

### Metodología

Antes de corregir cualquier hallazgo se verificó manualmente — la propia metodología que react-doctor
recomienda para sí mismo. Luego se lanzaron **4 agentes en paralelo**, cada uno en su propio _worktree_
de git aislado (`.claude/worktrees/agent-<id>/`, rama `worktree-agent-<id>`), cada uno responsable de
una familia de reglas distinta:

- Migración de `TouchableOpacity` a `Pressable`.
- Extracción de render props inline de `FlatList` (`rn-no-inline-flatlist-renderitem`).
- Conversión a `react-native-reanimated` (`rn-prefer-reanimated`).
- Limpieza de hooks: `exhaustive-deps`, estado derivado, `no-adjust-state-on-prop-change`.

Todas las ramas de agentes (`worktree-agent-aa6904d8461aa3997`, `worktree-agent-aa72e2398f7984703`,
`worktree-agent-ad2fe9e763b94763b`, `worktree-agent-af4681f993ceaf30b`) están completamente fusionadas
en `claude/setup-screen-navigator-dxvcj1`.

### Reglas de resolución de conflictos (aplican a fusiones futuras similares)

Fusionar cuatro ramas independientes que tocaban los mismos ficheros generó decenas de conflictos.
Cuatro patrones se repitieron lo suficiente como para convertirse en reglas fijas:

1. **`SafeAreaView` siempre desde `react-native-safe-area-context`, nunca desde `react-native`.**
   RN 0.86 eliminó `SafeAreaView` de `react-native` — importarlo de ahí es un crash real, no un lint.
   Cualquier conflicto que lo reintroducía se resolvía a favor de `safe-area-context`, sin excepción.

2. **Reanimated gana sobre lazy-ref-init.** Cuando la conversión a `useSharedValue`/`withTiming`
   chocaba con un fix anterior de `useState(() => new Animated.Value(x))` sobre el mismo valor, se
   conservaba siempre la versión Reanimated — es un superconjunto estricto del otro fix. Patrón:

   ```jsx
   const x = useSharedValue(initial);
   // ...
   x.value = withTiming(target, { duration });
   ```

   añadiendo la propia shared value al array de dependencias del efecto para satisfacer
   `exhaustive-deps`, aunque su referencia sea estable.

3. **`Pressable` gana sobre `TouchableOpacity`, pero se revisa la `key`.** La rama que hacía esta
   migración partía de código anterior a las correcciones de `key` por índice — había que comprobar
   caso por caso cuál `key` era realmente más estable en lugar de aceptar ciegamente `key={index}`.

4. **Funciones `render*Item` ya extraídas pueden quedar rotas por dentro.** Cuando una función
   `render*Item`/`renderRow` ya extraída (de un fix `rn-no-inline-flatlist-renderitem` anterior) se
   fusionaba limpiamente en el punto de llamada, su cuerpo interno a veces seguía referenciando
   `TouchableOpacity` tras desaparecer el import en otra rama — un fallo silencioso que solo `eslint`
   revelaba. Ocurrió en `pages/DietList.tsx`, `pages/ScreenExplorer.tsx`,
   `pages/migrated/water_reminders_screen.tsx` y `pages/migrated/water_tracker_screen.tsx`.

### Protocolo de verificación tras cada fusión

1. Script que detecta cualquier `SafeAreaView` importado de `react-native` (regex sobre imports).
2. Script que detecta llamadas a `set*()` huérfanas tras conversiones de `useState` a `useRef`.
3. `npx eslint . --ignore-pattern ".claude/worktrees/**"` — importante excluir los worktrees en curso,
   o eslint reporta como "errores del proyecto" el estado a medio terminar de agentes que aún no se
   han fusionado.
4. `npx tsc --noEmit` completo — detecta cosas que el parser de eslint no ve (p. ej. tipos incompatibles
   de Reanimated con props de `react-native-svg`).
5. `npx react-doctor@latest --no-telemetry --json` — escaneo completo para medir progreso real.

### Hallazgos notables durante la fusión

- **Worktree con base obsoleta (agent1):** un worktree se creó a mitad de turno sobre un commit
  anterior al indicado, y sus 60 ficheros tocados revertían silenciosamente el fix de SafeAreaView en
  22 de ellos — git no lo marcaba como conflicto porque ninguna otra rama tocaba esas líneas exactas.
  Detectado antes de fusionar gracias al script de verificación.
- **`bookmark_screen.tsx`:** `page`/`numPage` se habían convertido de `useState` a `useRef`, pero ambos
  se leen durante el render para los indicadores de carga — una mutación de ref no dispara re-render.
  Revertido por completo a `useState`. Regla general: una conversión `useState` → `useRef` solo es
  válida si el valor **nunca** se lee durante el render/JSX.
- **`add_shopping_list_screen.tsx`:** la versión con `useCallback` de `prefillForEdit` de un agente
  eliminaba lógica de negocio real presente en la versión previa (fechas de rango al editar una lista
  existente). Reconstruido conservando ambas.
- **`workout_detail_screen.tsx`:** declaración duplicada de `getDayExerciseData` tras una fusión — la
  versión antigua (sin `useCallback`) quedó como código muerto junto a la nueva versión correcta.
- **`recipe_list_screen_v2.tsx`:** faltaba el efecto de montaje/recarga tras fusionar una rama que
  partía de antes de la conversión de `ScrollView` a `FlatList`.
- **Componentes de gráficos (`AnimatedRing`, `CircularProgress`, `Linechart`, `Linechart2`):** tras
  fusionar la conversión final a Reanimated, `tsc` reveló 4 errores de tipos reales — pasar un
  `SharedValue` directo a `strokeDashoffset` de `react-native-svg` no tipa. Corregido usando
  `useAnimatedProps` en los cuatro componentes (commit `6c1ea99`).

### Estado final del escaneo

727 issues iniciales (33 errores) → **242 issues, 0 errores**, 165 ficheros afectados.

| Regla                            |     Casos | Estado                                                     |
| -------------------------------- | --------: | ---------------------------------------------------------- |
| `unused-file`                    |        99 | solo reporte — nunca autoborrado (convención del proyecto) |
| `rn-no-scrollview-mapped-list`   |        33 | omitido — refactor de mayor alcance                        |
| `no-array-index-as-key`          |        23 | omitido — requiere id estable caso por caso                |
| `no-giant-component`             |        17 | solo reporte — decisión arquitectónica                     |
| `exhaustive-deps`                |        16 | omitido — riesgo de cambiar comportamiento                 |
| `rn-prefer-reanimated`           |        12 | omitido — casos no triviales, fuera del lote               |
| `unused-dependency`              |        12 | solo reporte — revisión de `package.json`                  |
| `no-adjust-state-on-prop-change` |         6 | omitido                                                    |
| `prefer-useReducer`              |         6 | solo reporte — refactor arquitectónico                     |
| `unused-export`                  |         5 | solo reporte                                               |
| `rn-prefer-expo-image`           |         5 | omitido                                                    |
| `no-derived-state`               |         3 | omitido                                                    |
| otras 5 reglas                   | 5 (1 c/u) | casos aislados                                             |

**Convención del proyecto a respetar:** nunca eliminar automáticamente pantallas o ficheros marcados
como "sin uso" — solo señalarlos como `deletionCandidate` para revisión humana (ver
`pages/ScreenExplorer.tsx`).

### Estado final del repositorio

- Las 4 ramas de agentes están completamente fusionadas en `claude/setup-screen-navigator-dxvcj1` y
  subidas al remoto.
- `0` errores de eslint, `0` errores de `tsc --noEmit`, sin marcadores de conflicto residuales.
- Último commit: `6c1ea99`.
- No se abrió pull request — no se pidió explícitamente en esta sesión.

---

## Notas para próximas sesiones

- Los 242 avisos restantes de react-doctor son intencionalmente de solo-reporte; no son "trabajo a
  medias" — cada uno tiene un motivo documentado arriba para no haberse tocado.
- Si se retoma la limpieza de `unused-file`/`unused-export`/`unused-dependency`, hacerlo con revisión
  humana explícita por cada caso, nunca en bloque.
- Al fusionar trabajo de agentes en worktrees aislados, verificar siempre el `merge-base` real del
  worktree contra el commit esperado antes de confiar en que su diff está completo — ver el caso de
  agent1 arriba.
