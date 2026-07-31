# Encargo 3 — Auditoría y continuación de la migración de color (theme Bevel)

## Contexto

La app (React Native/Expo, "befit") tenía un theme oscuro morado/índigo desde
su origen. En dos rondas de trabajo (Encargo 2 + ajustes posteriores) se
migró **toda la app** a un theme claro inspirado en la app Bevel, con estas
decisiones ya cerradas con el usuario — **no las vuelvas a proponer ni a
preguntar**:

- Fondo principal claro (`#F2F2F7`), superficies blancas (`#FFFFFF`).
- Texto principal casi negro (`#1C1C1E`), no blanco.
- El acento de marca (antes morado `#7773FA`/`#5652E5`) es ahora **beige
  `#E3DCD9`** en todos sus usos como *relleno* (fondos, badges, botón "+",
  logo). Como *color de texto o de ícono* se corrigió a `#1C1C1E` en todos
  los casos ya auditados (ver más abajo) — un beige tan claro no se lee
  como texto ni como ícono pequeño sobre fondo claro.
- Esto **no fue una migración parcial** — se revisaron ~62 archivos reales
  (pantallas + componentes) buscando específicamente: texto en color claro,
  íconos en color claro, y fondos que habían quedado oscuros por accidente
  (ver "Bug de `C.white`" abajo). Este encargo es la **continuación** de esa
  auditoría, no el inicio.

**Nada de esto está commiteado todavía en git** — ver Paso 0.

---

## Paso 0 — Punto de restauración (obligatorio, antes de tocar nada)

```bash
git status
```

Vas a ver ~62 archivos modificados sin commitear (todo el trabajo de la
migración de color de las rondas anteriores). **No los deseches ni los
resetees.** Antes de investigar o cambiar nada:

1. Si el usuario no te dijo explícitamente que ya los commiteó, pregúntale
   qué quiere hacer con ellos, o comitéalos tú mismo con un mensaje
   descriptivo del estado actual (theme claro + fixes de contraste) **antes**
   de empezar tu propio trabajo — así tenés un punto real al que volver si
   algo sale mal.
2. Confirmá el punto de restauración:
   ```bash
   git log --oneline -1
   ```
   Guardá ese hash. Si algo se rompe durante tu investigación:
   ```bash
   git reset --hard <hash>
   ```

**No sigas al Paso 1 sin haber hecho esto.**

---

## 1. Arquitectura de color del proyecto (leer antes de tocar nada)

Hay **dos sistemas de color independientes** en este proyecto — no los
confundas ni intentes unificarlos, es una decisión ya tomada:

### 1.1 — El sistema real, usado por las 173+ pantallas de la app
`pages/migrated/theme.ts` exporta un objeto `C` (colores), `FONT`
(tipografías), `GRADIENT`, `RADIUS`, `SPACING`, `SHADOW`, `TYPE`. Las
pantallas hacen `import { C, FONT } from './theme'` (o rutas relativas
equivalentes) y usan `StyleSheet.create({...})` con `color: C.textPrimary`,
`backgroundColor: C.surface`, etc. — **es el único sistema de color que
importa para el trabajo visual real**. `constants/colors.ts` es un wrapper
delgado sobre este mismo `C` (ej. `TEXT_PRIMARY: C.white`) usado por algunas
pantallas de auth; no tiene colores propios salvo un par de excepciones ya
corregidas (`CARD_START`/`CARD_END`/`BORDER_START`/`BORDER_END`, ver más
abajo).

### 1.2 — El sistema de Gluestack-UI / NativeWind (paralelo, casi sin uso real)
`global.css` define tokens CSS (`--primary`, `--background`, etc.) que usan
los componentes de Gluestack-UI (`components/ui/button`, futuros
componentes). Hoy solo lo usan un par de componentes de prueba ya
retirados — **casi ninguna pantalla real de la app usa Gluestack-UI
todavía**. Si tu tarea es sobre las pantallas reales, ignorá este archivo.
Si el usuario te pide trabajar específicamente con componentes de
Gluestack-UI, ahí sí es relevante.

### 1.3 — Tokens clave de `C` (los que vas a usar)
```
Fondo/superficie:  C.bg (#F2F2F7) · C.surface (#FFFFFF) · C.surfaceLight (#F7F7F9) · C.card (=surface)
Texto:             C.textPrimary (#1C1C1E) · C.textSecondary (#6B6B70) · C.textTertiary (#8A8A90)
                   (aliases: white/textWhite/text = textPrimary; gray/gray50 = textSecondary; textMuted/gray30 = textTertiary)
Semánticos:        C.statusSuccess/Warning/Danger/Info/Rest/Cycle
Marca/acento:      C.primary/brand50/gray70 (=#E3DCD9, beige) · C.brand60/gray80 (=#E3DCD9 también, ver nota)
                   C.accentBlack (#000000, para CTAs estilo Bevel)
Grises neutros:    C.gray10...C.gray60 (escala independiente, no tocada)
```
**Nota importante**: `brand50` y `brand60` (y sus alias `gray70`/`gray80`)
son actualmente **el mismo valor** (`#E3DCD9`) — se unificaron en una ronda
reciente a pedido del usuario porque ambos eran variantes de morado y el
usuario decidió eliminar el morado por completo. Si en tu investigación ves
que hace falta un segundo tono (ej. un beige más oscuro para dar
profundidad/variantes), **preguntale al usuario antes de inventar un valor**
— no asumas qué tono quiere.

---

## 2. Reglas aprendidas (evitar repetir bugs ya encontrados)

### 2.1 — `C.white` es una trampa de nombres
Originalmente `white` significaba "texto blanco sobre fondo oscuro". Ahora
`C.white === C.textPrimary === "#1C1C1E"` (casi negro). La gran mayoría de
usos de `C.white` en el código son de texto/ícono y migraron correctamente
solos. **Pero se encontraron 12 casos donde `C.white` se usaba como
`backgroundColor`** (para pintar una superficie blanca real, ej. una tarjeta,
un badge, un input) — esos quedaron **oscuros por error** y ya se
corrigieron a `C.surface`. Si encontrás un fondo que se ve "sospechosamente
oscuro" en una pantalla, **lo primero que hay que mirar es si usa
`backgroundColor: C.white`** en vez de `C.surface`.

### 2.2 — Antes de tocar cualquier archivo, confirmá que está vivo
Este proyecto tiene **muchos archivos huérfanos** — pantallas duplicadas
que ya no se usan, algunas incluso dentro de `pages/migrated/` (no asumas
que "está en la carpeta migrated" = "está vivo"). Antes de editar CUALQUIER
archivo:
```bash
grep -n "NombreDelArchivo" App.tsx
```
Si no aparece registrado como `import` + `<Stack.Screen>` /
`<MStack.Screen>` en `App.tsx`, es casi seguro un huérfano — no lo toques,
no importa. Ejemplos ya confirmados huérfanos (no tocar):
`pages/migrated/login_screen.tsx`, `pages/migrated/welcome_auth_screen.tsx`,
`pages/migrated/password_reset_sent_screen.tsx`,
`pages/migrated/forgot_password_email_screen.tsx`,
`pages/migrated/forgot_password_options_screen.tsx`,
`pages/auth/fitness_assessment_screen.tsx`,
`pages/auth/register_flow_screen.tsx`.

**Al revés también aplica**: no asumas que un archivo directamente en
`pages/` (sin el prefijo `migrated/`) está muerto. `pages/WorkoutSummary.tsx`
(y el resto del sistema legacy "Rutinas": `Workout.tsx`, `WorkoutList.tsx`,
`WorkoutDetail.tsx`, `WorkoutDayExercises.tsx`, `WorkoutSessionScreen.tsx`,
`ExerciseList.tsx`, `ExerciseDetail.tsx`, `FavouriteWorkouts.tsx`) están
**activos** — es un sistema de catálogo de workouts distinto y más antiguo
que sigue en uso en paralelo (sección "Rutinas" de Home), decisión de
producto ya tomada de no unificarlo. La única forma confiable de saber si
un archivo importa es el grep de arriba, no su ubicación en carpetas.

### 2.3 — Antes de cambiar un color de texto/ícono, mirá su fondo
No existe un "color de texto seguro universal" — depende del fondo del
contenedor. El patrón de trabajo que hay que seguir:
1. Encontrar el `color:` o `color={...}` sospechoso.
2. Subir al contenedor padre (o al `style` combinado, ej.
   `[s.weekDayNumber, isSelected && s.weekDayNumberSelected]`) y encontrar su
   `backgroundColor`.
3. Si el fondo es claro (`C.bg`/`C.surface`/`C.surfaceLight`/blanco/gris
   claro) → el texto/ícono debe ser oscuro (`C.textPrimary` o
   `C.textSecondary` según jerarquía).
4. Si el fondo es oscuro (raro ahora, pero existe — ej. una insignia con
   fondo `C.gray80`/beige oscuro intencional, o superposiciones sobre foto)
   → el texto/ícono debe quedar claro.
5. **Cuidado con los estados condicionales** (`isSelected &&
   styleSelected`) — a veces la MISMA variable de color se usa para dos
   estados con fondos distintos (uno claro, uno oscuro) porque originalmente
   ambos fondos tenían tonos similares. Revisá cada estado por separado, no
   solo el estilo "base".

### 2.4 — Texto vs. ícono vs. fondo son 3 búsquedas distintas
Los patrones de código a buscar (con grep/ripgrep) son sintácticamente
diferentes y hay que buscar los tres por separado:
```bash
# Texto (StyleSheet, objeto de estilo)
grep -rnE "color:\s*C\.NOMBRE_DEL_TOKEN\b" --include="*.tsx" .

# Ícono (prop JSX, ej. <Ionicons color={...}>)
grep -rnE "color=\{C\.NOMBRE_DEL_TOKEN\}" --include="*.tsx" .

# Fondo
grep -rnE "backgroundColor:\s*C\.NOMBRE_DEL_TOKEN\b" --include="*.tsx" .
```
Siempre excluí `backgroundColor` del primer patrón (con `grep -v
backgroundColor`) para no confundir fondos con textos.

### 2.5 — Colores hardcodeados fuera de `C`
No todo pasa por `C`. Ya se encontraron y corrigieron:
- `constants/colors.ts` tenía `CARD_START`/`CARD_END`/`BORDER_START`/
  `BORDER_END` como hex sueltos (no referencian `C`) — quedaron
  desactualizados en la primera pasada de migración porque el grep de
  "`C.algo`" no los detecta. Ya corregidos, pero es la prueba de que puede
  haber más: buscá también hex literales viejos:
  ```bash
  grep -rln "7773FA\|5652E5\|1A1735\|141227" --include="*.tsx" --include="*.ts" .
  ```
  (Vas a encontrar coincidencias en archivos ya confirmados huérfanos y en
  `components/Barchart.tsx`/`CircularProgress.tsx`/`Linechart.tsx`/
  `WaterProgress.tsx`/`Button.tsx` — estos 5 componentes solo los usa
  `pages/Today.tsx` y `pages/Name.tsx`, ambos huérfanos confirmados, así que
  quedaron sin tocar a propósito. Si en tu investigación encontrás que algún
  huérfano de esta lista en realidad SÍ está registrado en `App.tsx` ahora,
  avisá antes de asumir que sigue muerto — la lista de huérfanos es un
  snapshot de esta fecha, no una garantía permanente.)

---

## 3. Qué queda pendiente / dónde enfocar la investigación

1. **Verificación visual pantalla por pantalla real** — hasta ahora la
   migración se verificó por lectura de código (contenedor/fondo) más
   spot-checks puntuales en dispositivo (Home Modern, Login, Register,
   Schedule). **Las ~40 pantallas de `pages/migrated/home/` y
   `pages/migrated/onboarding/` que se corrigieron por código nunca se
   abrieron una por una en el dispositivo real** — es el trabajo más
   valioso que podés hacer: navegar a cada una (usando
   `pages/ScreenExplorer.tsx`, el botón flotante "+" de Home, ya que lista
   las 168 pantallas por categoría) y confirmar visualmente que no hay
   texto invisible ni fondos oscuros inesperados.
2. **Sombras (`shadowColor`)** — no se tocaron a propósito (una sombra
   beige/clara es un problema cosmético menor, no de legibilidad). Si en tu
   recorrido ves sombras que se ven raras, es esto.
3. **`borderColor`** — no se auditó sistemáticamente (solo se tocó cuando
   apareció en el camino de un fix de fondo/texto). Un borde en un color
   equivocado es mucho menos grave que texto invisible, pero vale la pena
   un vistazo si tenés tiempo.
4. **Componentes de gráficos legacy** (`Barchart.tsx`, `CircularProgress.tsx`,
   `Linechart.tsx`, `Linechart2.tsx`, `Piechart.tsx`, `WaterProgress.tsx`,
   `Button.tsx` en `components/`) — varios tienen colores morados
   hardcodeados sin tocar porque sus únicos consumidores conocidos están
   huérfanos. Si tu investigación encuentra un consumidor real nuevo,
   avisá — no eran parte del alcance porque parecían muertos.
5. **`NavigationTab.tsx`** (la barra de navegación inferior real, activa) y
   **`assets/splash.png`** (pantalla de carga nativa) — **decisión ya
   tomada de NO tocarlos en las rondas anteriores**: ambos tienen
   gradientes/assets diseñados específicamente para fondo oscuro
   (`NavigationTab.tsx` con un glow degradado calibrado en rgba oscuros;
   `splash.png` con el fondo oscuro "horneado" en la imagen misma, no es un
   color de config). Arreglar esto bien requiere trabajo de diseño de
   assets (nueva imagen de splash, recalibrar el gradiente), no un simple
   cambio de valor. **No los toques sin que el usuario lo pida
   explícitamente sabiendo que es una tarea de diseño, no un fix rápido.**
6. **Modo oscuro** — `GluestackUIProvider` está fijo en `mode="light"`
   (`App.tsx`). El sistema de `C` no tiene una variante oscura (el theme
   oscuro original fue reemplazado, no conservado como alternativa). Si el
   usuario pregunta por modo oscuro, es una feature nueva, no algo que
   "restaurar" — avisale que el theme oscuro original ya no existe en el
   código.

---

## 4. Cómo verificar en dispositivo real (MobAI)

El proyecto usa un Galaxy S9+ real conectado por USB, controlado vía MobAI.
Antes de cualquier interacción con el dispositivo, leé el recurso
`mobai://reference/device-automation`.

**Arranque del entorno** (ver `docs/ARRANQUE_DESARROLLO.md` para el detalle
completo con troubleshooting):
```bash
# 1. Confirmar que el backend Laravel responde
curl -s -m 5 -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:8000/api/get-appsetting

# 2. Confirmar que Metro responde (si no, arrancarlo: npm start, en background)
curl -s -m 2 http://127.0.0.1:8081/status

# 3. SIEMPRE reconectar los túneles antes de probar — se caen solos entre
#    sesiones y es la causa #1 de "veo la app vieja" o "Unable to load script"
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8000 tcp:8000
```

**Para ver un cambio de color reflejado**, un `force-stop` + relanzamiento
limpio es más confiable que el reload in-app (a veces el bundle queda
pegado en una versión vieja con solo "R,R"):
```bash
adb shell am force-stop com.pfndesign.befit
```
y luego `open_app` con `fresh: true` vía MobAI.

**Si aparece "Unable to load script"**: reconectá los túneles (arriba) y
volvé a abrir. **Si el bundle no parece actualizarse** (el log de Metro
muestra siempre "1 module" en vez de recompilar todo): matá el proceso de
Metro (buscar el PID con `netstat -ano | grep ":8081"` y `taskkill //F //PID
<pid>`) y arrancalo de nuevo con `npx expo start --dev-client --clear`.

**Credenciales de prueba**: cuenta demo `demo@bestronger.app` / `Test1234`
(cliente 1:1, `is_personal_client=true`) ya logueada en el dispositivo en
sesiones anteriores.

---

## 5. Al terminar

- Si hiciste cambios de código, mostrale al usuario el resumen antes de
  comitear (no comitees sin que te lo pida explícitamente, salvo el punto de
  restauración del Paso 0 si el usuario ya aceptó esa parte).
- Si encontrás algo que requiere una decisión de diseño (no solo "arreglar
  contraste") — ej. un segundo tono de acento, qué hacer con
  `NavigationTab`/`splash.png`, modo oscuro — **preguntale al usuario en vez
  de decidir vos**, siguiendo el mismo criterio que se usó en todas las
  rondas anteriores de este trabajo.
- La ficha de color publicada como Artifact ("La paleta de BeFit") es la
  referencia visual del estado actual de `C` — si cambiás algún valor,
  actualizala también (pedile al usuario el link si no lo tenés, o generá
  una nueva).
