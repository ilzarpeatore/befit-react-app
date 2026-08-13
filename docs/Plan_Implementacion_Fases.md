# Plan de Implementación — Motor de Auto-Regulación de Carga y Features Relacionadas
### Guía técnica de ejecución por fases

Este documento define el orden de construcción, las dependencias entre piezas, y el detalle técnico (modelos de datos, endpoints, lógica de pipeline, criterios de aceptación) necesario para implementar sin ambigüedad. Pensado como input directo para desarrollo asistido por Claude Code.

**Stack de referencia:** Laravel 11 (backend), consistente con el resto de Be Stronger.

---

## Índice de fases

- **Fase 0** — Control de acceso por access_tier (capa transversal, aplica a todas las fases)
- **Fase 1** — Infraestructura base: captura de datos + interpretación + bloqueo por dolor
- **Fase 2** — Motor de auto-regulación de carga (reglas configurables)
- **Fase 3** — Detección de estancamiento + Sistema de evidencia visible
- **Fase 4** — Readiness score (Health data) + Modo vida real

Cada fase asume que las anteriores están completas y probadas. No empezar una fase sin criterios de aceptación de la anterior cumplidos.

---

## FASE 0 — Control de acceso por access_tier (transversal)

### Objetivo
Restringir el Motor de Auto-Regulación de Carga y todas las features relacionadas (estancamiento, evidencia visible, readiness score, modo vida real) a clientes `subscriber` y `personal`, excluyendo por completo a clientes `free`. Esta fase no es un bloque secuencial más — es una capa que se aplica **dentro** de cada fase posterior, en los puntos de entrada de cada pipeline/servicio, no como checks individuales repartidos por el código.

Se documenta como Fase 0 porque ya está construida (implementada por Claude Code antes de que el resto de fases avance), y el resto del documento debe leerse asumiendo que este gate ya existe y debe reutilizarse.

### 0.1 Estado actual (ya implementado y verificado)

- **`User::getAccessTierAttribute()`** — accessor calculado en vivo (no persistido en columna), disponible en backend (VPS producción + mirror local).
- **Expuesto en la API** — verificado en producción: el endpoint de detalle de usuario devuelve `"access_tier":"free"` (y equivalentes para `subscriber`/`personal`).
- **`Gate::define('paid-tier', ...)`** — gate de Laravel ya registrado, usable en cualquier controlador nuevo o existente con `Gate::allows('paid-tier')` / `Gate::authorize('paid-tier')`.
- **Tipos en frontend** (`api/profile.ts`, `api/auth.ts`) — ya reflejan `access_tier`, pendientes de conectar a `AuthContext` y a la primera pantalla real.
- **Verificado** con datos de prueba para los 3 casos (`free`, `subscriber`, `personal`), creados y borrados. Documentado en `TAREAS.md` del proyecto.

### 0.2 Regla de negocio

```
access_tier IN ('subscriber', 'personal') → acceso completo al motor y features relacionadas
access_tier = 'free'                       → excluido por completo
```

De momento `subscriber` y `personal` tienen acceso idéntico — no hay diferenciación de funcionalidad entre ambos todavía. Eso se define aparte, en una fase futura no cubierta por este documento.

### 0.3 Dónde debe aplicarse el gate (puntos de entrada, no dentro de cada servicio)

Usar `Gate::allows('paid-tier')` (o el equivalente ya definido) como comprobación **antes** de:

- **Fase 1** — Antes de encolar el job de `SessionInterpretationService` tras el evento `session.completed`. Si el cliente es `free`, no se genera `exercise_session_metrics` para el motor (más allá de lo que otras partes de la app no relacionadas con el motor pudieran necesitar independientemente).
- **Fase 1** — El bloqueo por dolor (`pain_reports` / notificación al coach) **no depende de este gate** — debe seguir funcionando para todos los clientes, tier aparte, porque es una cuestión de seguridad del cliente, no una feature premium.
- **Fase 2** — Antes de que `ProgressionRuleEngine::evaluateForExercise()` evalúe cualquier regla para un cliente.
- **Fase 2** — En los endpoints de panel de excepciones / sugerencias pendientes (`GET /api/clients/{id}/pending-suggestions`): un cliente `free` nunca debe aparecer ahí.
- **Fase 3** — Antes de que el job de detección de `achievement_events` procese la sesión de un cliente `free`.
- **Fase 3** — Antes de evaluar detección de estancamiento (reutiliza el mismo `ProgressionRuleEngine`, así que hereda el gate del punto anterior automáticamente).
- **Fase 4** — Antes de que el job diario de `ReadinessCalculationService` incluya al cliente en el cálculo de `readiness_scores`.
- **Fase 4** — El `AdaptiveWeekPlanner` (modo vida real) no debe generar propuestas para clientes `free`.

**Regla de implementación:** el gate se comprueba una sola vez por flujo, en el punto de entrada (el listener del evento, el inicio del job, el primer paso del controlador), nunca repetido dentro de cada método de cada servicio. Todo servicio de Fase 1-4 asume que si se está ejecutando, el gate ya se comprobó aguas arriba.

### 0.4 Cambio de tier de un cliente (free → subscriber/personal o viceversa)

- Si un cliente pasa de `free` a `subscriber`/`personal`, el motor empieza a generar métricas y evaluar reglas desde ese momento, respetando el cold start normal definido en 2.4 (`client_exercise_calibration`).
- **Pendiente de decisión de producto:** si existen `set_logs` históricos de cuando el cliente era `free` (poco probable si el gate está bien aplicado en Fase 1, pero posible si hubo datos previos a la implementación del gate), decidir si esas sesiones cuentan como histórico válido para el cold start o se descartan. Por defecto, mientras no se decida lo contrario: **no se descartan** — si el dato existe y es válido (no outlier, no incompleto), se aprovecha igual, para no penalizar al cliente con una calibración innecesaria.
- Si un cliente pasa de `subscriber`/`personal` a `free` (downgrade o cancelación), el motor deja de evaluar reglas nuevas pero **no se borra el histórico** — queda disponible por si el cliente vuelve a subir de tier.

### 0.5 Frontend

- `AuthContext` debe exponer `access_tier` del usuario autenticado para que la UI pueda ocultar/mostrar pantallas relacionadas con el motor (panel de sugerencias, readiness, achievements) sin depender de que el backend deniegue la petición como único mecanismo — evita parpadeos de UI o llamadas innecesarias.
- La primera pantalla a conectar (pendiente): la que consuma `pending-suggestions` o cualquier vista de progreso automatizado debe comprobar `access_tier` antes de intentar la llamada.

### 0.6 Criterios de aceptación Fase 0
- [x] `access_tier` calculado y expuesto en API (verificado en producción).
- [x] `Gate::define('paid-tier', ...)` registrado y funcional para los 3 tiers de prueba.
- [ ] Ningún job de Fase 1-4 se ejecuta para un cliente `free` (pendiente de aplicar el gate en cada punto de entrada listado en 0.3, a medida que se construyan esas fases).
- [ ] El bloqueo por dolor sigue funcionando para clientes `free` (verificar explícitamente que no se ve afectado por el gate).
- [ ] Un cambio de tier se refleja en el comportamiento del motor sin necesidad de intervención manual (sin caché obsoleta de tier, etc.).
- [ ] `AuthContext` expone `access_tier` en frontend.

---

## FASE 1 — Infraestructura base

### Objetivo
Construir la captura de datos crudos y el pipeline de interpretación (Capa 1 y 2) que todo lo demás va a consumir, incluyendo el bloqueo por dolor porque vive dentro de esta misma capa.

### 1.1 Modelo de datos — captura cruda

**Tabla `set_logs`**
```
id (uuid, pk)
exercise_id (fk)
client_id (fk)
session_id (fk)
set_number (int)
weight_prescribed (decimal)
reps_prescribed (int)
rir_target (decimal, nullable)
weight_actual (decimal)
reps_actual (int)
rir_reported (decimal, nullable)
completed (bool)
pain_flag (bool, default false)
pain_report_id (fk, nullable) -> ver 1.4
created_at, updated_at
```

**Tabla `sessions`** (si no existe ya en el esquema actual, revisar y extender)
```
id (uuid, pk)
client_id (fk)
program_id (fk)
scheduled_date (date)
status (enum: scheduled | completed | skipped)
completed_at (timestamp, nullable)
mesocycle_week (int) -- necesario para condiciones que dependan de fase
```

### 1.2 Pipeline de interpretación (Capa 2)

**Se ejecuta como job asíncrono tras el evento `session.completed`.**

Crear clase de servicio `SessionInterpretationService` con los siguientes métodos, en este orden de ejecución:

1. `aggregateSetLogs(session_id)` → calcula por ejercicio dentro de la sesión:
   - `rir_delta_sesión` = promedio de (`rir_reported` − `rir_target`) SOLO de sets con `rir_reported != null` y `completed = true`. Si no hay ningún set con RIR reportado → `null`.
   - `completion_ratio` = count(completed=true) / count(total sets prescritos)
   - `peor_serie` = set con menor `rir_reported` (ignorar nulls)
   - `carga_efectiva` = MAX(`weight_actual`) entre sets donde `reps_actual >= reps_prescribed` AND `completed = true`

2. `detectOutliers(client_id, exercise_id, carga_efectiva)` → compara contra la media de las últimas 5 sesiones válidas del mismo ejercicio/cliente. Si la desviación es >30%, marcar `is_outlier = true` en el registro agregado y **excluir del cálculo de tendencias** (no se borra el dato, solo se excluye de agregados).

3. `checkDataSufficiency(session_id, exercise_id)` → si >50% de los sets no tienen `rir_reported`, marcar `sin_dato_suficiente = true`. Esto se usa después para filtrar qué reglas pueden evaluarse.

4. `updateTrendMetrics(client_id, exercise_id)` → recalcula sobre ventana configurable (default N=3 sesiones válidas, no outliers, no `sin_dato_suficiente` si la regla lo requiere):
   - `tendencia_rir` = pendiente lineal simple de `rir_delta_sesión` en las N sesiones
   - `sesiones_consecutivas_sin_cambio` = contador de sesiones seguidas con mismo `carga_efectiva`
   - `e1RM_estimado` = fórmula Epley: `carga_efectiva * (1 + reps_actual/30)`, tomado de la mejor serie válida de la sesión
   - `racha_misma_dirección` = contador de veces que la última acción del motor fue igual a la anterior

**Tabla `exercise_session_metrics`** (output del pipeline, una fila por ejercicio+sesión)
```
id (uuid, pk)
session_id (fk)
exercise_id (fk)
client_id (fk)
rir_delta_sesión (decimal, nullable)
completion_ratio (decimal)
peor_serie_set_log_id (fk, nullable)
carga_efectiva (decimal, nullable)
is_outlier (bool)
sin_dato_suficiente (bool)
tendencia_rir (decimal, nullable)
sesiones_consecutivas_sin_cambio (int)
e1RM_estimado (decimal, nullable)
racha_misma_dirección (int)
blocked_by_pain (bool, default false)
created_at
```

**Importante:** ningún componente posterior (motor de reglas, detección de estancamiento, etc.) debe leer `set_logs` directamente. Todo consume `exercise_session_metrics`.

### 1.3 Bloqueo por dolor (se construye aquí, no en fase posterior)

**Tabla `pain_reports`**
```
id (uuid, pk)
client_id (fk)
exercise_id (fk)
session_id (fk)
set_number (int, nullable)
tipo (enum: molestia_leve | dolor_agudo | dolor_que_empeora_durante_sesión)
localización (string, tag corporal predefinido)
intensidad (int, 1-5)
momento (enum: al_iniciar | durante_ejecución | al_finalizar | al_día_siguiente)
created_at
```

**Lógica de bloqueo** (implementar en `SessionInterpretationService` como paso previo a cualquier otro cálculo):
- Si existe `pain_report` para `exercise_id` + `session_id` con `tipo != molestia_leve` OR `intensidad >= 4` → marcar `exercise_session_metrics.blocked_by_pain = true` y **no calcular tendencias de progresión para ese ejercicio en esa sesión**.
- Si `tipo = molestia_leve` AND `intensidad <= 2` → no bloquea tendencias, solo se registra.

**Detección de patrón recurrente:** job separado (puede ser diario, no crítico en tiempo real) que revisa: mismo `exercise_id` + `localización` con `pain_report` en 2+ sesiones distintas de los últimos 30 días → marcar `pain_pattern_flag = true` en una tabla de estado del cliente (`client_exercise_flags`), y disparar notificación al coach vía sistema de notificaciones existente.

**Notificación inmediata al coach:** al insertar un `pain_report` con `intensidad >= 4` o `tipo != molestia_leve`, disparar evento `PainAlertRaised` → listener que crea notificación push inmediata (usar el sistema de notificaciones ya existente en el backend, no crear uno nuevo).

### 1.4 Endpoints de Fase 1

```
POST   /api/sessions/{id}/sets                    -- registrar set_log (llamado durante ejecución)
POST   /api/sessions/{id}/pain-report              -- registrar dolor
POST   /api/sessions/{id}/complete                 -- cierra sesión, dispara job de interpretación
GET    /api/clients/{id}/exercises/{id}/metrics    -- consultar métricas interpretadas (debug/coach)
```

### 1.5 Criterios de aceptación Fase 1
- [ ] Un set registrado con RIR nulo no rompe el cálculo de `rir_delta_sesión` de la sesión.
- [ ] Un peso que se desvía >30% del histórico se marca outlier y no contamina `tendencia_rir`.
- [ ] Un `pain_report` con intensidad 4+ bloquea correctamente el cálculo de progresión de ese ejercicio y dispara notificación.
- [ ] El pipeline corre de forma asíncrona sin bloquear el cierre de sesión desde el cliente.
- [ ] Existe test que verifica que `set_logs` nunca se consulta fuera de `SessionInterpretationService`.

---

## FASE 2 — Motor de auto-regulación de carga

### Objetivo
Construir el motor de reglas configurable que consume `exercise_session_metrics` de la Fase 1 y genera propuestas de ajuste de carga.

### 2.1 Modelo de datos — reglas

**Tabla `progression_rules`**
```
id (uuid, pk)
coach_id (fk)
name (string)
scope_type (enum: global | categoría_ejercicio | ejercicio_específico | cliente_específico)
scope_id (uuid, nullable) -- id de categoría/ejercicio/cliente según scope_type
priority (int)
active (bool)
mode (enum: automático | sugerido_pendiente_aprobación)
fallback_behavior (enum: aplicar_igual | mantener_sin_cambio | escalar_a_notificación_urgente)
shadow_mode (bool, default false)
created_at, updated_at
```

**Tabla `progression_rule_conditions`** (una regla puede tener varias condiciones combinadas)
```
id (uuid, pk)
rule_id (fk)
variable (enum: rir_delta_sesión | completion_ratio | tendencia_rir |
                 sesiones_consecutivas_sin_cambio | peor_serie |
                 sin_dato_suficiente | e1RM_delta |
                 readiness_band | hrv_z_score | sueño_z_score) -- últimas 3 solo activas desde Fase 4
operator (enum: gte | lte | eq | between | no_change_for_n)
threshold_value (decimal, nullable)
threshold_min (decimal, nullable) -- para 'between'
threshold_max (decimal, nullable)
ventana_sesiones (int, default 1)
logic_group (int) -- para agrupar condiciones con AND dentro del mismo grupo, OR entre grupos
```

**Tabla `progression_rule_actions`**
```
id (uuid, pk)
rule_id (fk)
type (enum: ajustar_carga_pct | ajustar_carga_absoluta | ajustar_reps |
            mantener | bajar_carga_pct | sustituir_ejercicio |
            bloquear_progresión | marcar_para_coach)
value (decimal, nullable)
rounding (enum: nearest_1kg | nearest_2_5kg | none)
base_reference (enum: último_prescrito | último_efectivo | e1RM_estimado | primera_semana_mesociclo)
```

### 2.2 Motor de evaluación

Crear servicio `ProgressionRuleEngine` con método principal:

```
evaluateForExercise(client_id, exercise_id, session_id) -> RuleEvaluationResult
```

**Lógica interna, en este orden:**

1. Verificar `exercise_session_metrics.blocked_by_pain` → si true, devolver acción `bloquear_progresión`, fin (esta comprobación tiene prioridad absoluta y no pasa por ninguna regla configurada).
2. Verificar cold start (ver 2.4) → si el ejercicio/cliente está en periodo de calibración, devolver acción `mantener` con motivo `calibración`, fin.
3. Obtener todas las `progression_rules` activas del coach aplicables (por scope, filtrando por cliente/ejercicio/categoría correspondiente).
4. Ordenar por jerarquía fija de scope: `cliente_específico` > `ejercicio_específico` > `categoría_ejercicio` > `global`. Dentro del mismo scope, ordenar por `priority` descendente; en empate, por `created_at` descendente (más reciente gana) y loggear el empate.
5. Para cada regla en orden, evaluar sus `progression_rule_conditions` contra `exercise_session_metrics` (agrupando por `logic_group`: AND dentro del grupo, OR entre grupos). Si `sin_dato_suficiente = true` en las métricas, excluir automáticamente cualquier regla que dependa de `rir_delta_sesión` o `peor_serie` de esa evaluación.
6. La primera regla que matchea gana (comportamiento default; permitir flag futuro de apilar si se requiere, no implementar en Fase 2).
7. Ejecutar la acción de la regla ganadora → calcular el valor final aplicando `base_reference` y `rounding`.
8. Escribir resultado en `next_session_targets`.

**Tabla `next_session_targets`**
```
id (uuid, pk)
client_id (fk)
exercise_id (fk)
rule_id (fk, nullable) -- null si es fallback o calibración
proposed_weight (decimal, nullable)
proposed_reps (int, nullable)
status (enum: aplicado | pendiente | rechazado)
generated_at (timestamp)
resolved_at (timestamp, nullable)
resolved_by (fk usuario, nullable)
```

### 2.3 Flujo automático vs. sugerido

- Si `progression_rules.mode = automático` → `next_session_targets.status = aplicado` inmediatamente, y el valor se puebla directamente en la siguiente sesión programada de ese ejercicio (actualizar `weight_prescribed` de los `set_logs` pre-generados, o el mecanismo equivalente ya existente para poblar sesiones).
- Si `mode = sugerido_pendiente_aprobación` → `status = pendiente`, aparece en endpoint de panel de excepciones.
- Si no hay respuesta del coach antes de que la sesión correspondiente se vuelva "próxima" (definir ventana, ej. 24h antes) → aplicar `fallback_behavior` de la regla.

**Tabla `override_logs`**
```
id (uuid, pk)
next_session_target_id (fk)
rule_id (fk)
client_id (fk)
exercise_id (fk)
suggested_value (decimal)
applied_value (decimal)
action_taken (enum: accepted | edited | rejected)
motivo (string, nullable)
created_at
```

**Job de calibración automática** (puede ser semanal, no crítico): revisar `override_logs` agrupados por `rule_id` + `client_id`; si hay 4+ ediciones consecutivas en la misma dirección con desviación similar (>2% de diferencia consistente), generar notificación al coach sugiriendo ajustar el parámetro base de la regla.

### 2.4 Cold start

**Tabla `client_exercise_calibration`**
```
client_id (fk)
exercise_id (fk)
sessions_completed (int, default 0)
calibration_complete (bool, default false)
```

Lógica: cada vez que se completa una sesión con ese ejercicio, incrementar `sessions_completed`. Cuando alcance el mínimo configurado por la regla aplicable (default global: 2), marcar `calibration_complete = true`. Mientras `calibration_complete = false`, el motor devuelve siempre `mantener` (usar `weight_prescribed` original de la plantilla del coach).

### 2.5 Endpoints de Fase 2

```
POST   /api/coaches/{id}/rules                          -- crear regla
PUT    /api/rules/{id}                                   -- editar regla
DELETE /api/rules/{id}
GET    /api/coaches/{id}/rules                           -- listar reglas
POST   /api/rules/{id}/simulate                           -- dry-run contra histórico
GET    /api/clients/{id}/pending-suggestions              -- panel de excepciones
POST   /api/suggestions/{id}/approve
POST   /api/suggestions/{id}/edit
POST   /api/suggestions/{id}/reject
GET    /api/exercises/{id}/progression-history?client_id=  -- auditoría
GET    /api/rules/{id}/audit                               -- % aceptación/edición/rechazo
```

### 2.6 Modo simulación y modo sombra

- **Simulación**: `POST /api/rules/{id}/simulate` con `client_id` + rango de fechas → ejecuta `ProgressionRuleEngine` contra `exercise_session_metrics` históricos existentes, sin escribir en `next_session_targets`. Devuelve array de resultados por sesión.
- **Modo sombra**: si `progression_rules.shadow_mode = true`, el motor evalúa y escribe en una tabla paralela `shadow_evaluations` (mismo esquema que `next_session_targets`) en vez de la real, visible solo en un endpoint de coach, sin generar sugerencias activas ni aplicar nada.

### 2.7 Criterios de aceptación Fase 2
- [ ] Una regla `cliente_específico` gana siempre sobre una `global` con mayor prioridad numérica.
- [ ] Un ejercicio en calibración nunca recibe una propuesta de cambio de carga.
- [ ] El modo simulación no escribe ningún dato en `next_session_targets`.
- [ ] Un override editado 4 veces en la misma dirección genera notificación de recalibración.
- [ ] Bloqueo por dolor tiene prioridad sobre cualquier regla, verificado con test de integración.

---

## FASE 3 — Detección de estancamiento + Evidencia visible

*(Ambas features consumen `exercise_session_metrics` de Fase 1 y pueden construirse en paralelo; no dependen entre sí.)*

### 3.1 Detección de estancamiento

Se implementa como un tipo especial de regla del motor (reutilizar `ProgressionRuleEngine`, no crear motor nuevo), con acción `sustituir_ejercicio`.

**Lógica adicional necesaria antes de disparar sustitución** (implementar como validación previa a ejecutar la acción cuando `type = sustituir_ejercicio`):
```
NO disparar sustitución si:
  - readiness_band = bajo en >50% de las sesiones de la ventana evaluada (Fase 4; si Fase 4 no está implementada aún, omitir esta condición)
  - completion_ratio de la ventana está bajando (posible sobreentrenamiento, no estancamiento simple) -> en este caso, marcar_para_coach en vez de sustituir
```

**Tabla `exercise_substitutions`** (mapeo de variantes por categoría, definido por el coach)
```
id (uuid, pk)
coach_id (fk)
original_exercise_id (fk)
substitute_exercise_id (fk)
category (string)
```

Al ejecutar `sustituir_ejercicio`, buscar en `exercise_substitutions` una variante para `original_exercise_id`. Si no existe, degradar la acción a `marcar_para_coach` (nunca sustituir sin alternativa predefinida).

### 3.2 Sistema de evidencia visible

**Tabla `achievement_events`**
```
id (uuid, pk)
client_id (fk)
type (enum: pr_carga | pr_reps | racha_sesiones | mesociclo_cerrado | mejora_e1rm | hito_compliance)
exercise_id (fk, nullable)
value (decimal, nullable)
previous_best (decimal, nullable)
significancia_verificada (bool)
shown_to_client (bool, default false)
created_at
```

**Lógica de detección** (job tras el pipeline de interpretación de Fase 1, como listener adicional del evento `session.completed`):
- PR de carga: `carga_efectiva` de la sesión > MAX histórico previo de `carga_efectiva` para ese ejercicio+cliente, Y la sesión no está marcada `is_outlier`. Umbral mínimo configurable (default: cualquier mejora cuenta, pero no si la diferencia es <2.5% para evitar ruido de redondeo).
- Racha de sesiones: contador simple de `sessions.status = completed` consecutivas sin gap, con hitos en 5/10/20/50.
- Cierre de mesociclo: trigger desde el evento existente de cierre de mesociclo (ya en el sistema), genera comparativa `carga_efectiva` inicial vs. final por ejercicio principal.

**Endpoints**
```
GET /api/clients/{id}/achievements               -- feed de logros
POST /api/clients/{id}/achievements/{id}/seen     -- marcar como visto
GET /api/coaches/{id}/achievement-settings        -- umbrales configurables
```

### 3.3 Criterios de aceptación Fase 3
- [ ] Un estancamiento no dispara sustitución si no existe variante definida — se marca para el coach en su lugar.
- [ ] Un PR no se genera sobre una sesión marcada como outlier.
- [ ] Las rachas se resetean correctamente si hay una sesión `skipped` (no `completed`) en medio.

---

## FASE 4 — Readiness score + Modo vida real

### 4.1 Readiness score

**Tabla `health_data_points`**
```
id (uuid, pk)
client_id (fk)
source (enum: apple_health | google_health | manual)
metric_type (enum: hrv | sleep_hours | resting_hr | steps)
value (decimal)
recorded_date (date)
synced_at (timestamp)
```

**Tabla `readiness_questionnaire_responses`**
```
id (uuid, pk)
client_id (fk)
date (date)
energia (int, 1-5, nullable)
estrés (int, 1-5, nullable)
sueño_percibido (int, 1-5, nullable)
dolor_muscular_general (int, 1-5, nullable)
```

**Cálculo de readiness** — servicio `ReadinessCalculationService`, job diario (ej. 6:00 AM, antes de que empiecen las sesiones del día):

1. Para cada cliente con datos disponibles, calcular media móvil y desviación estándar de los últimos 14 días por métrica (`hrv`, `sleep_hours`) desde `health_data_points`.
2. **Cold start**: si el cliente tiene <7 días de histórico en una métrica, no calcular z_score para esa métrica — excluirla del cálculo combinado (no rellenar con valor neutro).
3. Calcular `hrv_z_score`, `sueño_z_score` normales si hay suficiente histórico.
4. Calcular `subjetivo_score` = promedio ponderado del cuestionario del día si existe respuesta.
5. Calcular `ACWR` = carga aguda (suma `carga_efectiva` últimos 7 días) / carga crónica (media móvil 4 semanas). Reutiliza datos ya existentes de `exercise_session_metrics`.
6. Combinar con pesos configurables por coach (default sugerido: hrv 0.3, sueño 0.3, subjetivo 0.25, ACWR 0.15), **redistribuyendo proporcionalmente entre las fuentes disponibles si falta alguna**.
7. Resolución de conflicto entre señales: si `hrv_z_score` es positivo (bueno) pero `subjetivo_score` indica mal estado (ej. ≤2/5), dar prioridad al dato subjetivo peor de los dos para la banda final — el umbral de "bajo" se activa si CUALQUIERA de las dos fuentes principales (objetiva o subjetiva) está en zona baja, no solo el promedio ponderado. Esto evita que un buen HRV oculte que el cliente se siente mal.
8. Mapear a banda: `óptimo | reducido | bajo | dato_insuficiente`.

**Tabla `readiness_scores`**
```
id (uuid, pk)
client_id (fk)
date (date)
hrv_z_score (decimal, nullable)
sueño_z_score (decimal, nullable)
subjetivo_score (decimal, nullable)
acwr (decimal, nullable)
combined_score (decimal, nullable)
band (enum: óptimo | reducido | bajo | dato_insuficiente)
calculated_at (timestamp)
```

**Sincronización con Health APIs** — consideraciones de implementación:
- Los datos de Health pueden llegar con delay (ej. sueño de anoche sincronizado a media mañana). El job diario debe correr lo suficientemente tarde, o re-ejecutarse si llegan datos nuevos con `recorded_date` de días ya procesados (recalcular ese día, no bloquear).
- Si hay múltiples fuentes para la misma métrica/día (ej. Apple Watch + otro dispositivo), usar la de mayor prioridad configurada por el usuario, o promediar si son comparables — definir explícitamente `source_priority` en configuración de cliente antes de implementar, no asumir.

**Conexión con el motor (Fase 2):** las variables `readiness_band`, `hrv_z_score`, `sueño_z_score` en `progression_rule_conditions` ya estaban contempladas en el esquema — activarlas ahora que `readiness_scores` existe como fuente real.

### 4.2 Modo vida real / plan adaptativo

**Tabla `adaptive_week_plans`**
```
id (uuid, pk)
client_id (fk)
original_week_start (date)
sessions_available (int)
priorización (enum: mantener_ejercicios_principales | mantener_grupo_muscular_prioritario | mantener_distribución_semanal_completa)
mesocycle_extension (bool) -- true = alarga mesociclo, false = mantiene duración fija
status (enum: propuesto | aprobado | aplicado)
created_at
```

Lógica de generación: reutilizar `client_exercise_overrides` ya existente para aplicar la versión reducida solo a esa semana, sin tocar la plantilla base. El algoritmo de reducción prioriza ejercicios principales y elimina accesorios según configuración — implementar como servicio `AdaptiveWeekPlanner` que **siempre** devuelve `status = propuesto`, nunca se aplica sin aprobación del coach.

### 4.3 Criterios de aceptación Fase 4
- [ ] Un cliente sin wearable conectado sigue recibiendo evaluación de reglas del motor con normalidad, sin errores por falta de `readiness_band`.
- [ ] Un cliente con <7 días de histórico de HRV no genera `hrv_z_score`, y el combinado se calcula solo con las fuentes disponibles.
- [ ] Un readiness bajo por cuestionario subjetivo baja la banda aunque el HRV sea bueno.
- [ ] Una semana reducida no se aplica al calendario del cliente sin aprobación explícita del coach.
- [ ] El mesociclo se extiende o no según la preferencia configurada, sin comportamiento por defecto silencioso.

---

## Notas generales para Claude Code

- **Todo servicio o job de Fase 1 en adelante (salvo el bloqueo por dolor) debe asumir que el gate `Gate::allows('paid-tier')` (Fase 0) ya se comprobó en el punto de entrada del flujo.** No repetir la comprobación dentro de cada método — ver 0.3 para la lista exacta de puntos de entrada.
- Todas las tablas nuevas deben incluir `created_at`/`updated_at` estándar de Laravel salvo que se indique lo contrario.
- Todos los jobs asíncronos deben ser idempotentes (reintentar sin duplicar efectos) — especialmente relevante para el pipeline de interpretación y el cálculo de readiness.
- Ningún componente de Fase 2 en adelante debe hacer queries directas a `set_logs` — siempre a través de `exercise_session_metrics`.
- Los enums de scope/mode/type deben implementarse como Enums nativos de PHP 8.1+ (Laravel 11 los soporta), no strings sueltos.
- Cada fase debe tener su propio conjunto de tests de integración cubriendo los criterios de aceptación listados antes de pasar a la siguiente.

---

*Documento generado a partir de la conversación de desarrollo de Be Stronger — agosto 2026.*
