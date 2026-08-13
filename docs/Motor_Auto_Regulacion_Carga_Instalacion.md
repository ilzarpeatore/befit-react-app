# Motor de Auto-Regulación de Carga — Documentación de instalación e integración

**Fecha de construcción:** 2026-08-10/11
**Alcance:** solo clientes `subscriber`/`personal` (gateado por `Gate::allows('paid-tier')`), con una excepción de seguridad (bloqueo por dolor, sin gate)
**Repos tocados:** VPS `/var/www/testapp` (producción real) + mirror local `mightyfitness/fitness-backend` (mantenidos en sync byte-idéntico, verificado con `md5sum`)
**Plan original:** `~/.claude/plans/wondrous-spinning-coral.md`
**Spec de referencia:** `docs/Plan_Implementacion_Fases.md` (usado como guía, no como spec literal — ver sección de reconciliación)

Este documento existe para servir de plantilla de referencia al diseñar las fases de instalación de futuros features: qué se investigó antes de construir, cómo se decidió reutilizar vs. crear tablas nuevas, el orden real de ejecución, los puntos de enganche en código ya existente, y qué quedó pendiente y por qué.

---

## 1. Principio rector: investigar antes de construir

Antes de escribir una sola migración, se lanzaron **3 agentes de investigación en paralelo**, cada uno contra una pieza distinta del backend real:

1. Modelo de datos de sesiones de entrenamiento existente.
2. Sistema de PRs (personal records) / readiness ya existente.
3. Estado real de `access_tier` (free/subscriber/personal) y del `Gate` que lo consume.

**Hallazgo central:** buena parte de lo que el documento de referencia pedía como "tabla nueva" **ya existía en producción con forma distinta**. Construir en paralelo sin reconciliar habría duplicado sistemas reales ya en uso. Esta investigación previa es el paso que más tiempo ahorró en toda la ejecución — evitó reimplementar el cálculo de PRs, evitó crear un segundo sistema de readiness, y evitó (por muy poco) chocar con una tabla `progression_rules` que ya existía en producción con un propósito totalmente distinto.

### Tabla de reconciliación (qué se reutilizó vs. qué es genuinamente nuevo)

| Concepto del documento                                                                                                                                                                                                                                      | Ya existía como...                                                                                                                                                   | Decisión final                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessions`                                                                                                                                                                                                                                                  | `workout_session_reviews` (creada en `ClientCalendarController::finishSession()`)                                                                                    | Reutilizar. `mesocycle_week` se resuelve vía `program_day_assignments.week_number`, ya existente.                                                                                                                                   |
| `set_logs`                                                                                                                                                                                                                                                  | `client_exercise_logs.logged_sets` (JSON con claves libres `carga`/`reps`/`rir`/`rpe`)                                                                               | Reutilizar vía parseo, no normalizar a tabla nueva.                                                                                                                                                                                 |
| Evento `session.completed`                                                                                                                                                                                                                                  | No existía como evento formal — `ClientCalendarController::finishSession()` es el punto de cierre real                                                               | Extender ese método directamente, no inventar un evento nuevo.                                                                                                                                                                      |
| `achievement_events` (PR de carga/e1RM)                                                                                                                                                                                                                     | `personal_records` + `ClientExerciseLogObserver` ya calculaba y notificaba, **sin gate, para todos los clientes**                                                    | No se reimplementa el cálculo. `achievement_events` es una capa de feed/historial nueva, gateada a paid-tier, que se escribe **además de** lo que ya existía — la notificación real de PR sigue intacta para todos, incluidos free. |
| `readiness_questionnaire_responses`                                                                                                                                                                                                                         | `daily_readiness_checks` (sleep_quality, soreness_level, energy_level, stress_level)                                                                                 | Reutilizar directamente, mapea 1:1 conceptualmente.                                                                                                                                                                                 |
| `client_exercise_overrides` (modo vida real)                                                                                                                                                                                                                | Ya existía tal cual (prescripción individual por cliente sobre plantilla compartida)                                                                                 | Reutilizar directamente.                                                                                                                                                                                                            |
| `progression_rules` (nombre pedido por el documento)                                                                                                                                                                                                        | **Ya existía en producción con propósito totalmente distinto**: multiplicador de carga semanal por programa (`TrainingProgramGeneratorService`), 0 filas pero en uso | Renombrado a `session_progression_rules` en todo el esquema nuevo — ver incidente en §4.                                                                                                                                            |
| `exercise_session_metrics`, `pain_reports`, `client_exercise_calibration`, `session_progression_rule_conditions/actions`, `next_session_targets`, `override_logs`, `exercise_substitutions`, `achievement_events`, `health_data_points`, `readiness_scores` | No existía nada equivalente                                                                                                                                          | Genuinamente nuevas, construidas tal cual el documento (con ajustes de nombrado ASCII, ver §5).                                                                                                                                     |

---

## 2. Orden real de ejecución

El plan se dividió en **4 fases con dependencia estricta**, ejecutadas con subagentes especializados:

```
Fase 0 (ya construida en ronda anterior)
  └─ 1 añadido: AuthContext.isPaidTier
Fase 1 — Infraestructura base (sola primero, es la base de todo lo demás)
  └─ Fase 2 (motor de reglas)   ─┐
  └─ Fase 4 (readiness)         ─┤  en paralelo, sin dependencia mutua
Fase 3 — Estancamiento + logros ←┘  al final, depende de Fase 2 (reutiliza su motor)
                                     y de Fase 4 (lee readiness_band)
```

- **Fase 1 se construyó sola primero** porque todo lo demás depende de `exercise_session_metrics` y del punto de enganche en `finishSession()`.
- **Fase 2 y Fase 4 se lanzaron en paralelo** porque no comparten tablas ni lógica entre sí.
- **Fase 3 se dejó para el final** porque reutiliza el motor de reglas de Fase 2 (no construye uno nuevo) y consulta `readiness_scores` de Fase 4 para decidir entre "sustituir ejercicio" o "marcar para coach" (posible sobreentrenamiento).

Cada fase se verificó de forma aislada (`php -l`, migraciones corridas, curl real, datos de prueba creados y limpiados) antes de dar paso a la siguiente.

---

## 3. Fase 0 — Prerrequisito de acceso (ya existente, un añadido)

No es parte de este feature, pero es su prerrequisito: sin esto, no había forma de gatear nada.

- `User::getAccessTierAttribute()` — calculado en vivo (nunca guardado en BD), a partir de `activePackageSubscriptions()`.
- `Gate::define('paid-tier', ...)` en `AuthServiceProvider`.
- Expuesto en `UserResource`/`UserDetailResource`.
- **Añadido en esta ronda:** `store/AuthContext.tsx` gana `isPaidTier: boolean` derivado (`state.user?.access_tier !== 'free'`), para que las pantallas nuevas no repitan la comparación de string en cada sitio.

---

## 4. Incidente de infraestructura durante la ejecución (resuelto sin pérdida)

Los 2 primeros intentos de lanzar Fase 2 y Fase 4 **en paralelo** murieron a mitad de ejecución por fallos de infraestructura (stream interrumpido / timeout de 600s) — **no por errores de lógica**.

**Protocolo seguido antes de relanzar nada:**

1. Se verificó el estado real en el VPS: **ningún cambio había llegado a producción** (intacta).
2. Se inspeccionó el mirror local: tenía trabajo parcial sustancial y de alta calidad.
3. Se encontró que el propio agente caído de Fase 2 ya había detectado por su cuenta que `progression_rules` (el nombre que pedía el documento) colisionaba con una tabla real de producción con propósito distinto, y ya la había renombrado a `session_progression_rules` con un comentario explicando el porqué — antes de morir.
4. Se corrió `php -l` en todo lo tocado (limpio) y se revisaron a mano los archivos compartidos entre ambos agentes (`routes/api.php`, `Kernel.php`, `AppServiceProvider.php`, `User.php`) para descartar duplicación o corrupción.
5. Se relanzaron **2 agentes de continuación** (no de reinicio) con instrucciones precisas de qué ya existía, para que terminaran solo lo que faltaba.

**Lección para futuras instalaciones por fases:** cuando un agente/proceso muere a mitad de una migración de esquema, no asumir que hay que empezar de cero — verificar primero qué llegó realmente a producción vs. qué quedó a medias en el entorno local, y qué decisiones ya tomó el proceso caído que valga la pena conservar.

---

## 5. Fase 1 — Infraestructura base

**Objetivo:** capturar e interpretar cada sesión de entrenamiento sin tocar el flujo de cierre existente más de lo estrictamente necesario.

### Tablas nuevas

**`exercise_session_metrics`** — una fila por ejercicio+sesión, output de `SessionInterpretationService`. Es la tabla que **todo componente de Fase 2 en adelante debe leer** — ningún componente posterior lee `client_exercise_logs` directamente (regla explícita del documento, para no duplicar la lógica de parseo del JSON en varios sitios).

| Columna                            | Tipo                           | Notas                                                                                                                                                                               |
| ---------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workout_session_review_id`        | FK → `workout_session_reviews` | Identificador real de sesión ya existente, no se inventó uno nuevo                                                                                                                  |
| `exercise_id`                      | FK → `exercises`               |                                                                                                                                                                                     |
| `client_id`                        | FK → `users`                   |                                                                                                                                                                                     |
| `rir_delta_sesion`                 | decimal(6,2) nullable          |                                                                                                                                                                                     |
| `completion_ratio`                 | decimal(5,2) nullable          |                                                                                                                                                                                     |
| `peor_serie_index`                 | unsignedSmallInteger nullable  | Índice 0-based dentro de `logged_sets` (JSON no normalizado a tabla)                                                                                                                |
| `peor_serie_rir`                   | decimal(5,2) nullable          | **Añadida en Fase 2** — el índice solo no bastaba, la condición `peor_serie` del motor de reglas necesita un valor numérico comparable sin leer `client_exercise_logs` directamente |
| `carga_efectiva`                   | decimal(8,2) nullable          |                                                                                                                                                                                     |
| `is_outlier`                       | boolean default false          | Detecta desviación >30%                                                                                                                                                             |
| `sin_dato_suficiente`              | boolean default false          |                                                                                                                                                                                     |
| `tendencia_rir`                    | decimal(6,3) nullable          |                                                                                                                                                                                     |
| `sesiones_consecutivas_sin_cambio` | unsignedInteger default 0      |                                                                                                                                                                                     |
| `e1rm_estimado`                    | decimal(8,2) nullable          |                                                                                                                                                                                     |
| `racha_misma_direccion`            | unsignedInteger default 0      | Poblado por el motor de reglas en Fase 2, queda a 0 hasta entonces                                                                                                                  |
| `blocked_by_pain`                  | boolean default false          |                                                                                                                                                                                     |

Restricciones clave: `unique(workout_session_review_id, exercise_id)` — **idempotencia del job**, reprocesar la misma sesión no duplica filas.

**`pain_reports`** — bloqueo por dolor. **Sin gate de tier — aplica a todos los clientes, es seguridad, no una feature de pago.** Se registra durante la sesión (antes de que exista `workout_session_reviews`, que se crea al cerrar), por eso identifica la sesión por `program_day_assignment_id` o `workout_template_id`, igual que ya hace `finishSession()`.

| Columna                                             | Notas                                                                       |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| `client_id`, `exercise_id`                          | FKs                                                                         |
| `program_day_assignment_id` / `workout_template_id` | Nullable, al menos uno presente                                             |
| `set_number`                                        | nullable                                                                    |
| `tipo`                                              | `molestia_leve` \| `dolor_agudo` \| `dolor_que_empeora_durante_sesion`      |
| `localizacion`                                      | tag corporal predefinido                                                    |
| `intensidad`                                        | 1-5                                                                         |
| `momento`                                           | `al_iniciar` \| `durante_ejecucion` \| `al_finalizar` \| `al_dia_siguiente` |

**`client_exercise_flags`** — estado derivado, hoy solo `pain_pattern_flag` (mismo ejercicio+localización con `pain_report` en 2+ sesiones distintas de los últimos 30 días). `unique(client_id, exercise_id, localizacion)`.

**`client_exercise_calibration`** — cold start. `sessions_completed` (incrementado en Fase 1 dentro de `finishSession()`), `calibration_complete`. `unique(client_id, exercise_id)`.

### Servicios y lógica

- **`app/Services/SessionInterpretationService.php`** (nuevo): `aggregateSetLogs()`, `detectOutliers()`, `checkDataSufficiency()`, `updateTrendMetrics()`. Lee `ClientExerciseLog::where('program_day_assignment_id', ...)->where('performed_date', ...)->get()` y parsea `logged_sets` (JSON) en vez de consultar una tabla normalizada.
- Bloqueo por dolor resuelto dentro del mismo servicio, sin gate.
- **Notificación al coach**: reutiliza `CommonNotification` (mismo patrón que `ClientExerciseLogObserver::notifyNewRecord()`), resolviendo el coach vía `User.coach_id` (columna real confirmada) + nueva relación `coach()` (`belongsTo`) añadida a `User.php`.
- **Job asíncrono:** `App\Jobs\ProcessSessionInterpretation` (idempotente, reintentar no duplica).
- **Comando programado:** `check:pain-patterns` — corre diario (`Kernel.php`), detecta patrón recurrente y activa `client_exercise_flags`.

### Punto de enganche real (no se inventó ningún evento)

`ClientCalendarController::finishSession()` (línea ~239) se extendió — **no se creó un evento `session.completed` nuevo**. El gate de tier se comprueba **una única vez**, en este punto de entrada:

```php
if (Gate::forUser($user)->allows('paid-tier')) {
    ProcessSessionInterpretation::dispatch($review);
    // ... Fase 2 y Fase 3 se enganchan aquí también, ver más abajo
}
```

Un cliente `free` nunca genera `exercise_session_metrics` — pero su `WorkoutSessionReview` se sigue creando exactamente igual que siempre (el flujo base, sin gate, no cambió).

### Endpoints nuevos

- `POST /api/sessions/{id}/pain-report`
- `GET /api/clients/{id}/exercises/{exerciseId}/metrics`

(El registro de sets y el cierre de sesión ya existían — `logSets()`/`finishSession()` — no se duplicaron.)

### Bug real encontrado y corregido durante la verificación

`ClientExerciseCalibration` necesitaba `protected $table` explícito — Eloquent pluralizaba mal el nombre por defecto. Sin este fix habría dado **500 en cada `finishSession` de un cliente de pago**.

### Verificación

Tinker con datos de prueba (set con RIR nulo, peso desviado >30%, `pain_report` intensidad 4+) + curl real contra los 2 endpoints nuevos, datos limpiados después.

---

## 6. Fase 2 — Motor de reglas de progresión

**Objetivo:** decidir automáticamente el ajuste de carga de la próxima sesión, con jerarquía de prioridad configurable por el coach.

### El incidente de nombrado (ver también §4)

El documento original llama a la tabla principal `progression_rules`. Esa tabla **ya existía en producción** (`2026_07_15_090002_create_progression_rules_table.php`) con un propósito completamente distinto: multiplicador de carga semanal _por programa_ (semana → `load_multiplier`/`is_deload`), consumido por `TrainingProgramGeneratorService`, con 0 filas pero **en uso real**. Reutilizar el nombre habría chocado con datos de producción de un feature ya activo. Se prefijó `session_` en todo el esquema nuevo para dejar la distinción explícita: la tabla nueva actúa _sesión a sesión_ sobre el auto-regulador de carga; la vieja actúa _semana a semana_ sobre la generación de programas.

### Tablas nuevas

**`session_progression_rules`**

| Columna             | Notas                                                                           |
| ------------------- | ------------------------------------------------------------------------------- |
| `coach_id`          | FK → `users`                                                                    |
| `name`              |                                                                                 |
| `scope_type`        | Enum PHP 8.1+ (`App\Enums\ScopeType`), guardado como string                     |
| `scope_id`          | nullable — id de categoría/ejercicio/cliente según `scope_type`, null si global |
| `priority`          | int, default 0                                                                  |
| `active`            | boolean default true                                                            |
| `mode`              | Enum `RuleMode`                                                                 |
| `fallback_behavior` | Enum `FallbackBehavior`                                                         |
| `shadow_mode`       | boolean default false                                                           |

Índices: `(scope_type, scope_id, active)`, `(coach_id, active)`.

**`session_progression_rule_conditions`** — condiciones combinables (AND dentro del mismo `logic_group`, OR entre grupos distintos):

`rule_id` (FK), `variable` (Enum `ConditionVariable`), `operator` (Enum `ConditionOperator`), `threshold_value`/`threshold_min`/`threshold_max` (decimal nullable), `ventana_sesiones` (default 1), `logic_group` (default 0).

**`session_progression_rule_actions`** — 1 acción por regla (`unique(rule_id)` lo hace explícito en el esquema, no solo por convención): `rule_id`, `type` (Enum `ActionType`), `value` (decimal nullable), `rounding` (Enum `RoundingMode`), `base_reference` (Enum `BaseReference`).

**`next_session_targets`** — output real del motor, una fila por evaluación (`client_id`+`exercise_id`):

`client_id`, `exercise_id`, `rule_id` (nullable — null si es fallback/calibración/bloqueo por dolor), `proposed_weight`, `proposed_reps`, `proposed_exercise_id` (**añadida en Fase 3**, ver §7), `status` (Enum `TargetStatus`, default `pendiente`), `generated_at`, `resolved_at`, `resolved_by` (FK → `users`).

**`override_logs`** — log de auditoría de solo-inserción (el propio esquema del documento omite `updated_at`, respetado tal cual — excepción explícita a la convención general del proyecto):

`next_session_target_id` (FK), `rule_id` (nullable FK), `client_id`, `exercise_id`, `suggested_value`, `applied_value`, `action_taken` (Enum `ActionTaken`), `motivo` (text nullable), solo `created_at` (`useCurrent()`).

### 10 Enums nativos PHP 8.1+ (`app/Enums/`)

`ScopeType`, `RuleMode`, `FallbackBehavior`, `ConditionVariable`, `ConditionOperator`, `ActionType`, `RoundingMode`, `BaseReference`, `TargetStatus`, `ActionTaken`.

### Servicio central

**`app/Services/SessionProgressionRuleEngine.php`** — `evaluateForExercise()`, con la jerarquía exacta:

```
dolor > cold start > cliente_específico > ejercicio_específico > categoría > global
```

(por `priority` y luego `created_at`). Consume **exclusivamente** `exercise_session_metrics` (nunca `client_exercise_logs` directamente).

- **Modo automático**: aplica vía `ClientExerciseOverride` ya existente (no se creó mecanismo de aplicación nuevo).
- **Modo sugerido**: pasa por panel de excepciones (coach aprueba/edita/rechaza).
- **Fallback por ventana de tiempo** si no hay regla aplicable.
- **Modo simulación** (dry-run real, verificado que no escribe nada) y **modo sombra** (evalúa sin aplicar, para que el coach compare antes de activar una regla).

### Punto de enganche

Job `EvaluateSessionProgressionRules`, despachado dentro del mismo bloque `Gate::allows('paid-tier')` de `finishSession()`, **justo después** de `ProcessSessionInterpretation` (con `QUEUE_CONNECTION=sync`, corre en línea y en orden, porque depende de las `exercise_session_metrics` que el job anterior acaba de generar).

### Endpoints (12 total)

```
POST   /api/coaches/{id}/rules
GET    /api/coaches/{id}/rules
PUT    /api/rules/{id}
DELETE /api/rules/{id}
POST   /api/rules/{id}/simulate
GET    /api/rules/{id}/shadow-evaluations
GET    /api/rules/{id}/audit
GET    /api/clients/{id}/pending-suggestions
POST   /api/suggestions/{id}/approve
POST   /api/suggestions/{id}/edit
POST   /api/suggestions/{id}/reject
GET    /api/exercises/{id}/progression-history
```

Autorización resuelta **dentro del controlador** (`SessionProgressionRuleController::requireCoach`), comparando el `{id}` de la URL contra `auth()->id()` — mismo patrón que otros recursos `coach_id=auth()->id()` del proyecto (`WorkoutTemplateController`, `ClientTagController`, etc.), sin prefijo `/admin` porque no existe un rol "coach" separado de "admin" en este esquema.

### Bug real encontrado y corregido

El check de "es coach" usaba `hasRole('admin')` (patrón Spatie) cuando en este proyecto "coach" es `user_type='coach'` — habría bloqueado a coaches reales de gestionar sus propias reglas.

### Verificación

Test de integración para prioridad de scope (cliente_específico gana aunque tenga menor priority numérica que global), cold start bloqueando propuestas, modo simulación confirmado sin escritura real.

---

## 7. Fase 3 — Estancamiento + evidencia visible (logros)

**Objetivo:** detectar estancamiento sin construir un motor nuevo, y hacer visibles los logros que ya se calculaban pero eran efímeros.

### Tablas nuevas

**`exercise_substitutions`** — mapeo de variantes por categoría, definido por el coach:

`coach_id` (FK), `original_exercise_id` (FK), `substitute_exercise_id` (FK), `category` (nullable). Índice `(coach_id, original_exercise_id)`.

**`achievement_events`** — capa de **feed/historial**, no de recálculo:

| Columna                     | Notas                                                                                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_id`                 | FK                                                                                                                                                                                                                |
| `type`                      | Enum `AchievementEventType`                                                                                                                                                                                       |
| `exercise_id`               | FK nullable                                                                                                                                                                                                       |
| `value` / `previous_best`   | decimal(10,2) nullable                                                                                                                                                                                            |
| `significancia_verificada`  | boolean default true                                                                                                                                                                                              |
| `shown_to_client`           | boolean default false                                                                                                                                                                                             |
| `source_type` / `source_id` | referencia polimórfica libre, sin FK — `App\Models\PersonalRecord` para `pr_carga`/`mejora_e1rm`, `App\Models\ClientExerciseLog` para `pr_reps`, `null` para `racha_sesiones`/`hito_compliance`/`progreso_sesion` |

### Migraciones aditivas relacionadas

- `peor_serie_rir` añadida a `exercise_session_metrics` (ver §5, necesaria para que la condición `peor_serie` del motor de Fase 2 no tuviera que leer `client_exercise_logs`).
- `proposed_exercise_id` añadida a `next_session_targets` (nullable, `onDelete('set null')`) — la acción `sustituir_ejercicio` necesita proponer un ejercicio distinto, no un valor numérico como el resto de acciones.

### Lógica

- **Estancamiento**: reutiliza `SessionProgressionRuleEngine` (**no motor nuevo**). Antes de sustituir, comprueba `readiness_band=bajo` en >50% de la ventana (de Fase 4) y `completion_ratio` descendente (posible sobreentrenamiento) → si se cumple, `marcar_para_coach` en vez de sustituir. Sin variante definida en `exercise_substitutions` → mismo fallback.
- **Sustitución de ejercicio siempre queda `pendiente`**, nunca se auto-aplica — no existe hoy un mecanismo seguro para cambiar un ejercicio del plan automáticamente (a diferencia del ajuste de carga, que sí reutiliza `ClientExerciseOverride`).
- **PRs (`pr_carga`/`mejora_e1rm`)**: cuando `ClientExerciseLogObserver` crea un `PersonalRecord`, si el cliente es paid-tier, **también** escribe una fila en `achievement_events` apuntando a ese `PersonalRecord` — el cálculo y la notificación real de PR siguen intactos para **todos** los clientes, sin gate.
- **`progreso_sesion`** (evidencia sesión-vs-sesión-anterior): `WorkoutSessionStatsService::computeAchievements()` ya comparaba contra la sesión anterior pero era efímero (solo en la response de `finishSession`) — ahora se persiste vía `ClientCalendarController::persistSessionProgressAchievements()`.
- **Racha de sesiones**: patrón algorítmico de `Habit::getCurrentStreakAttribute()` (el patrón, no el código) sobre `WorkoutSessionReview`, hitos 5/10/20/50. Reset correcto si hay sesión saltada — resuelto cruzando el calendario (`program_day_assignments` esperadas) contra `workout_session_reviews` (completadas), ya que no existe un estado explícito de "sesión saltada".
- **`hito_compliance`**: 80%+ de sesiones programadas completadas en ventana de 4 semanas, con mínimo 8 sesiones programadas para evitar falsos positivos.
- **`mesociclo_cerrado` deliberadamente NO implementado** — sin trigger real de "cierre de mesociclo" en el código (revisado `TrainingProgram`/`ProgramClientAssignment`/scheduler). Queda como valor de enum sin lógica detrás, documentado como pendiente en vez de inventar un evento falso.

### Punto de enganche

Job `EvaluateSessionAchievements`, despachado dentro del mismo bloque gateado de `finishSession()`, después de `EvaluateSessionProgressionRules` (racha + hito de compliance no dependen de datos efímeros del request, solo de `client_id`).

### Endpoints

```
GET  /api/clients/{id}/achievements
POST /api/clients/{id}/achievements/{achievementId}/seen
GET  /api/coaches/{id}/achievement-settings
```

Todos gateados a `paid-tier` dentro del controlador. La sustitución de ejercicio no tiene endpoint propio — vive dentro del motor de reglas de Fase 2.

### Verificación

PR sobre sesión outlier no genera logro; estancamiento sin sustituto se marca para coach en vez de sustituir; racha se resetea con sesión saltada real.

---

## 8. Fase 4 — Readiness score + modo vida real

**Objetivo:** cruzar datos de salud (objetivos) con el cuestionario diario (subjetivo) en un único score, y permitir reducir la semana de un cliente cuando el score es bajo.

### Tablas nuevas

**`health_data_points`** — histórico crudo de lecturas de salud (no existía ningún histórico persistido en backend hasta ahora, `helper/health.ts` solo leía snapshots en vivo del dispositivo):

| Columna         | Notas                                             |
| --------------- | ------------------------------------------------- |
| `client_id`     | FK                                                |
| `source`        | `apple_health` \| `google_health` \| `manual`     |
| `metric_type`   | `hrv` \| `sleep_hours` \| `resting_hr` \| `steps` |
| `value`         | decimal(10,2)                                     |
| `recorded_date` | date                                              |
| `synced_at`     | timestamp nullable                                |

`unique(client_id, source, metric_type, recorded_date)` — idempotencia: reenviar la lectura del mismo día (ej. HealthKit corrige el valor de sueño más tarde) actualiza en vez de duplicar (`updateOrCreate`).

**`readiness_scores`** — output diario de `ReadinessCalculationService`:

| Columna                                                                     | Notas                                                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------- |
| `client_id`                                                                 | FK                                                      |
| `date`                                                                      | date                                                    |
| `hrv_z_score`, `sueno_z_score`, `subjetivo_score`, `acwr`, `combined_score` | decimal(8,4) nullable                                   |
| `band`                                                                      | `optimo` \| `reducido` \| `bajo` \| `dato_insuficiente` |
| `calculated_at`                                                             | timestamp nullable                                      |

`unique(client_id, date)` — el job diario es idempotente.

**Nota de nombrado (ASCII):** el documento original proponía `sueño_z_score` (con ñ) — normalizado a `sueno_z_score` para ser consistente con el resto del esquema real, que evita tildes/eñes en identificadores de columna sistemáticamente (mismo criterio que `localizacion`/`intensidad`/`momento` en `pain_reports`).

### `readiness_questionnaire_responses` deliberadamente NO se creó

`ReadinessCalculationService` lee directamente `daily_readiness_checks` (ya existente) para el componente subjetivo — mapea 1:1 conceptualmente, no había razón para duplicar.

### Servicios

- **`app/Services/ReadinessCalculationService.php`** — job diario: cold start de 14 días, resolución de conflicto subjetivo-vs-objetivo (**gana el peor de los 2**), pesos configurables, redistribución de pesos si falta una fuente (ej. sin HRV → el score se calcula solo con `subjetivo_score`+`ACWR`).
- **`app/Services/AdaptiveWeekPlanner.php`** — siempre produce plan en estado `propuesto`, reutiliza `ClientExerciseOverride` ya existente para aplicar la semana reducida cuando el coach aprueba.

### Frontend (`helper/health.ts`)

Ampliado con `getHRV()`, `getRestingHeartRate()`, `getSleepMinutes()`:

- iOS: `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` / `RestingHeartRate` / `HKCategoryTypeIdentifierSleepAnalysis` (ya soportados por el paquete instalado, solo faltaba usarlos).
- Android: `HeartRateVariabilityRmssdRecord` / `RestingHeartRateRecord` / `SleepSessionRecord` (Health Connect, ya en `types/records.types.d.ts`).
- Sumados a `toRead` en `requestHealthPermissions()`.

**Nota de plataforma explícita en el código:** en iOS, estas 3 funciones devuelven `null` mientras HealthKit siga bloqueado (cuenta Apple Developer gratuita — ver bloqueante documentado aparte). `ReadinessCalculationService` ya maneja "fuente no disponible" como caso normal (redistribuye pesos), sin necesitar workaround adicional.

### Comando programado

`readiness:calculate` — `dailyAt('06:00')` en `Kernel.php`. Gate `paid-tier` comprobado dentro del job, antes de incluir un cliente en el cálculo diario.

### Endpoints

```
POST /api/health-data-points/sync
POST /api/adaptive-week-plans/generate
POST /api/adaptive-week-plans/{id}/approve
```

`sync` **sin gate de tier** (el gate real vive en el job diario de `ReadinessCalculationService`, no en la ingesta). `generate()`/`approve()` sí gatean por `coach_id` del cliente.

### Pendiente, no implementado

**`AdaptiveWeekPlan`**: el flujo `propuesto → aprobado` está completo y verificado; **`aprobado → aplicado`** (escribir los `ClientExerciseOverride` reales de la semana reducida) **no se implementó** — sin trigger definido para cuándo debe pasar (¿automático al aprobar? ¿al empezar la semana siguiente?). Decisión de producto pendiente, no técnica.

**Sincronización real desde dispositivo**: `helper/health.ts::getSleepMinutes()` ya existe, pero nada en la app llama todavía a `POST /api/health-data-points/sync` de forma periódica — falta conectar a una pantalla/hook real (ej. al abrir Home).

**HRV entre plataformas**: no comparable en bruto (iOS mide SDNN, Android mide RMSSD, algoritmos distintos) — no invalida el z-score individual (se calcula contra el propio histórico del cliente), documentado por si algún día se comparan valores absolutos entre plataformas.

### Verificación

Cliente sin wearable conectado (o en iOS) sigue recibiendo evaluación de reglas con normalidad; cliente con <7 días de HRV no genera `hrv_z_score`; readiness bajo por cuestionario baja la banda aunque HRV sea bueno; semana reducida no se aplica sin aprobación del coach.

---

## 9. Diagrama de flujo — una sesión de principio a fin

```
finishSession()  [ClientCalendarController, ya existía, extendido]
       │
       ▼
Gate::allows('paid-tier')?
       │
   ┌───┴────┐
   no        sí
   │          │
   ▼          ▼
 Free    SessionInterpretationService (Fase 1)
(solo    agrega logged_sets, detecta outliers
review,        │
 nada          ▼
 más)     blocked_by_pain?
               │
           ┌───┴────┐
           sí        no
           │          │
   Notifica coach   calibration_complete?
   (SIEMPRE,             │
   sin gate)          ┌──┴───┐
   + bloquear         no      sí
   progresión,        │        │
   fin                ▼        ▼
                  mantener  SessionProgressionRuleEngine (Fase 2)
                  (calibr.)      │
                                 ▼
                          ¿Estancamiento? (Fase 3, reusa el motor)
                                 │
                    ┌────────────┴─────────────┐
                readiness_band=bajo >50%    resto de casos
                  o completion_ratio↓            │
                    │                       sustituir_ejercicio /
                    ▼                       ajustar_carga / mantener
              marcar_para_coach

  (en paralelo, mismo gate)
  EvaluateSessionAchievements (Fase 3) — PRs ya calculados + rachas
  readiness_scores (Fase 4) — job diario aparte, alimenta 'readiness_band'
  que el motor de reglas consulta arriba
```

---

## 10. Checklist reutilizable para instalar features similares por fases

Extraído de lo que funcionó bien en esta ejecución — usar como plantilla:

1. **Investigar el backend real con agentes en paralelo antes de escribir una migración.** Cada investigación cubre una pieza distinta (modelo de datos relacionado, sistema similar ya existente, mecanismo de autorización a reutilizar). El objetivo es encontrar colisiones de nombre/propósito con tablas ya en producción — como pasó con `progression_rules`.
2. **Producir una tabla de reconciliación explícita** (spec del documento vs. qué existe vs. decisión) antes de construir. Aprobarla con el usuario si el proyecto lo requiere.
3. **Dividir en fases con dependencia real, no arbitraria.** Fase base primero y sola; fases sin dependencia mutua en paralelo; fases que reutilizan trabajo de otras al final.
4. **Enganchar en el punto de entrada real ya existente**, nunca inventar un evento nuevo si ya hay un método/controlador que cierra el flujo (aquí: `finishSession()`).
5. **Comprobar el gate de autorización una sola vez, en el punto de entrada**, no repetido en cada servicio interno.
6. **Diseñar jobs asíncronos idempotentes desde el principio** (`unique` constraints en las tablas de output, `updateOrCreate` en vez de `create`) — un reintento o reprocesamiento no debe duplicar filas.
7. **Ante fallos de infraestructura a mitad de ejecución paralela: verificar antes de relanzar.** Confirmar qué llegó a producción real, inspeccionar qué decisiones ya tomó el proceso caído (pueden ser correctas y valer la pena conservar), relanzar como continuación, no como reinicio.
8. **Verificar cada fase de forma aislada** antes de dar paso a la siguiente: sintaxis limpia, migraciones corridas sin error, curl real contra producción con datos de prueba creados y limpiados, comparación de checksums entre entornos si hay más de uno.
9. **Documentar lo deliberadamente NO implementado**, con la razón técnica concreta (sin trigger real, sin decisión de producto tomada) en vez de forzar una implementación sobre un evento inventado.
10. **Mantener nombrado ASCII consistente** con el resto del esquema aunque la spec de referencia use acentos — evita fricción futura en tooling/migraciones.

---

## Referencias

- Plan aprobado: `~/.claude/plans/wondrous-spinning-coral.md`
- Registro de ejecución: `docs/TAREAS.md` (sección "Motor de Auto-Regulación de Carga — 4 fases completas")
- Artifact visual: "Esquema de arquitectura — BeFit App" (Lámina 11)
- Migraciones: `mightyfitness/fitness-backend/database/migrations/2026_08_10_*` y `2026_08_11_*`
- Servicios: `app/Services/{SessionInterpretationService,SessionProgressionRuleEngine,ReadinessCalculationService,AdaptiveWeekPlanner}.php`
- Enums: `app/Enums/{ScopeType,RuleMode,FallbackBehavior,ConditionVariable,ConditionOperator,ActionType,RoundingMode,BaseReference,TargetStatus,ActionTaken,AchievementEventType}.php`
- Jobs: `app/Jobs/{ProcessSessionInterpretation,EvaluateSessionProgressionRules,EvaluateSessionAchievements}.php`
- Comandos programados: `app/Console/Commands/{DetectPainPatterns,CalculateReadinessScores}.php` (`check:pain-patterns` diario, `readiness:calculate` diario a las 06:00)
- Punto de enganche: `app/Http/Controllers/API/ClientCalendarController.php::finishSession()`
