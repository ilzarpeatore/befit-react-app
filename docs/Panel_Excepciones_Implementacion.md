# Panel de Excepciones del Coach
### Especificación de implementación

Feed unificado que agrega, prioriza y presenta al coach todo lo que requiere su atención — sin que tenga que revisar cliente por cliente. No es una feature nueva de cálculo: es una **capa de agregación** sobre datos que el Motor de Auto-Regulación ya genera (Fases 1-4, ya implementadas y verificadas).

---

## 0. Investigación previa (obligatoria antes de escribir migraciones)

Antes de crear ninguna tabla, seguir el mismo principio aplicado en la instalación del Motor: investigar el backend real con los siguientes focos, y documentar hallazgos en una tabla de reconciliación igual que se hizo con `progression_rules`:

1. **Revisar `CommonNotification`** (ya usado para notificar dolor y PRs, según el MD de instalación del Motor) — comprobar si ya existe algún mecanismo de "bandeja" o listado persistente de notificaciones por coach, o si `CommonNotification` es solo push efímero sin registro consultable. Si ya existe una tabla de notificaciones con estructura similar (coach_id, tipo, leído/no leído, referencia a origen), evaluar si el panel de excepciones debe **extender esa tabla** en vez de crear una nueva — evitar duplicar el mismo concepto de "cosa pendiente de revisar" en dos sistemas paralelos.
2. **Revisar si existe ya algún endpoint o vista de "dashboard de coach"** en el admin panel (Next.js/shadcn) que ya liste clientes o alertas, aunque sea de forma parcial, para no duplicar UI ni lógica de agregación.
3. **Confirmar el modelo real de relación coach-cliente** (ya se sabe que existe `User.coach_id` y la relación `coach()` añadida en la Fase 1 del Motor — reutilizar, no reinventar).

Producir una tabla de reconciliación (spec de este documento vs. qué existe vs. decisión final) antes de construir, igual que se hizo en la instalación del Motor.

---

## 1. Objetivo y alcance

Agregar en un único feed, ordenado por severidad, los siguientes eventos que **ya se generan hoy** en el sistema:

| Categoría | Fuente real ya existente | Generado en |
|---|---|---|
| Dolor agudo / patrón recurrente | `pain_reports` (intensidad≥4 o `tipo≠molestia_leve`) + `client_exercise_flags.pain_pattern_flag` | Fase 1 del Motor |
| Estancamiento sin sustituto / posible sobreentrenamiento | `next_session_targets` con `status=pendiente` y acción `marcar_para_coach` | Fase 3 del Motor |
| Sugerencia de ajuste de carga pendiente | `next_session_targets` con `status=pendiente` y acción `ajustar_carga_pct`/`ajustar_carga_absoluta`/`sustituir_ejercicio` | Fase 2 del Motor |
| Readiness bajo sostenido | `readiness_scores.band=bajo` | Fase 4 del Motor |
| Semana adaptativa pendiente de aprobar | `adaptive_week_plans.status=propuesto` | Fase 4 del Motor |
| Inactividad del cliente | **No existe fuente aún** — ver §5, alcance reducido para esta iteración | — |

**Fuera de alcance en esta iteración** (dejar documentado como pendiente, no inventar): el score de riesgo de abandono compuesto y la alerta de silencio de 20 días completa, definidos en el roadmap general pero no desarrollados técnicamente todavía. En su lugar, §5 propone una versión mínima de "sesión no completada reciente" que sí se puede construir ahora con datos existentes, sin bloquear el resto del panel.

---

## 2. Modelo de datos

### 2.1 Tabla nueva: `coach_exception_items`

Registro persistente de cada ítem del feed — necesario para poder marcar como resuelto/descartado y no recalcular todo en cada request. **No sustituye** a las tablas origen (`pain_reports`, `next_session_targets`, etc.) — es una capa de índice/feed sobre ellas.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `coach_id` | FK → `users` | Resuelto vía `client.coach_id` en el momento de generar el ítem |
| `client_id` | FK → `users` | |
| `category` | enum (`ExceptionCategory`): `dolor`, `estancamiento`, `sugerencia_carga`, `readiness_bajo`, `semana_adaptativa_pendiente`, `inactividad` | |
| `severity` | enum (`ExceptionSeverity`): `alta`, `media`, `baja` | Ver §3 para asignación por categoría |
| `source_type` | string, nullable | Nombre de modelo origen (`PainReport`, `NextSessionTarget`, `ReadinessScore`, `AdaptiveWeekPlan`), null para `inactividad` |
| `source_id` | uuid, nullable | Referencia polimórfica libre — mismo patrón que `achievement_events.source_type/source_id`, sin FK física |
| `title` | string | Generado al crear el ítem, ej. "Dolor reportado en press banca" |
| `description` | text, nullable | Contexto adicional (valores, tendencia) para no obligar al coach a abrir el detalle |
| `status` | enum (`ExceptionStatus`): `pendiente`, `resuelta`, `descartada` | default `pendiente` |
| `resolved_at` | timestamp, nullable | |
| `resolved_by` | FK → `users`, nullable | |
| `created_at` | timestamp | |

**Índices:** `(coach_id, status, severity)` para el listado principal; `unique(source_type, source_id)` cuando `source_type` no es null — **evita duplicar el mismo ítem si el listener se dispara dos veces** (idempotencia, mismo criterio que el resto del Motor).

### 2.2 Enums nuevos (`app/Enums/`)

`ExceptionCategory`, `ExceptionSeverity`, `ExceptionStatus` — mismo patrón de Enums nativos PHP 8.1+ ya usado en el resto del Motor (`ScopeType`, `RuleMode`, etc.).

---

## 3. Lógica de generación por categoría

Cada categoría se genera mediante un **listener** enganchado al evento/job que ya la produce — no se crea un nuevo job que recorra todo el sistema buscando excepciones, se aprovechan los puntos donde el dato ya se genera.

### 3.1 Dolor (`severity = alta` siempre)

- **Listener de `PainAlertRaised`** (evento ya existente según el MD de instalación, disparado al insertar `pain_reports` con intensidad≥4 o tipo≠molestia_leve): crear `coach_exception_item` con `category=dolor`, `source_type=PainReport`, `title` incluyendo ejercicio y localización.
- **Listener del comando `check:pain-patterns`** (ya existente, Fase 1): cuando marca `client_exercise_flags.pain_pattern_flag=true`, crear un ítem adicional con `title` indicando "patrón recurrente" — distinto del ítem de dolor puntual, no lo sustituye (un cliente puede tener ambos).

### 3.2 Estancamiento / sobreentrenamiento (`severity = media`)

- **Listener sobre la escritura de `next_session_targets`** cuando `SessionProgressionRuleEngine` (Fase 2/3) resuelve la acción como `marcar_para_coach` (el fallback que ya existe cuando no hay sustituto definido o hay posible sobreentrenamiento): crear ítem con `category=estancamiento`, `source_type=NextSessionTarget`.
- Distinguir en `description` si el motivo fue "sin variante definida" o "posible sobreentrenamiento" (el motor ya determina cuál de los dos aplicó, según §7 del MD de instalación — reutilizar ese dato, no volver a calcularlo).

### 3.3 Sugerencia de ajuste de carga pendiente (`severity = baja`)

- **Listener sobre `next_session_targets`** cuando `status=pendiente` y la acción es `ajustar_carga_pct`, `ajustar_carga_absoluta` o `sustituir_ejercicio` (esta última con sustituto sí definido, a diferencia de 3.2): crear ítem con `category=sugerencia_carga`.
- **Al resolverse la sugerencia** (`POST /api/suggestions/{id}/approve|edit|reject`, endpoint ya existente de Fase 2): el mismo controlador debe marcar el `coach_exception_item` correspondiente (`source_type=NextSessionTarget`, `source_id=next_session_target.id`) como `status=resuelta`, `resolved_by=coach`. **No debe quedar un ítem huérfano en el panel después de que el coach ya actuó sobre la sugerencia original.**

### 3.4 Readiness bajo sostenido (`severity = media`)

- **No generar un ítem por cada día individual de `readiness_scores.band=bajo`** (generaría ruido diario). Generar solo si `band=bajo` en **2+ días consecutivos** para el mismo cliente — el job `readiness:calculate` (ya existente, Fase 4) debe comprobar el día anterior antes de decidir si crea el ítem.
- Si el readiness vuelve a `óptimo`/`reducido` al día siguiente, marcar automáticamente como `resuelta` el ítem abierto (si existe) dentro del mismo job diario — evita que el coach tenga que descartarlo manualmente cuando ya se resolvió solo.

### 3.5 Semana adaptativa pendiente de aprobar (`severity = media`)

- **Listener sobre la creación de `adaptive_week_plans`** con `status=propuesto` (ya existente, Fase 4): crear ítem. Se resuelve automáticamente cuando el coach usa el endpoint ya existente `POST /api/adaptive-week-plans/{id}/approve` (o su rechazo, si existe esa acción) — mismo patrón que 3.3.

### 3.6 Inactividad — versión mínima para esta iteración

**No implementar el score de riesgo de abandono completo.** Construir solo lo siguiente, que no requiere infraestructura nueva:

- Job diario (nuevo, `check:client-inactivity`, mismo patrón `dailyAt()` en `Kernel.php` que el resto): para cada cliente `paid-tier` con coach asignado, comprobar si tiene **alguna** `program_day_assignment` con fecha pasada (dentro de los últimos 7 días) sin `workout_session_review` asociada (sesión programada y no completada, ni siquiera como adaptativa).
- Si hay **2 o más sesiones perdidas** en los últimos 7 días → crear ítem `category=inactividad`, `severity=media`, sin `source_type`/`source_id` (no hay un registro único de origen, es un conteo).
- **Dejar explícitamente documentado en el código** (comentario en el job) que esto es una versión mínima, y que el criterio real de 20 días / score compuesto de riesgo de abandono queda pendiente como feature separada — para que quien retome esto no lo confunda con la versión completa ya diseñada en el roadmap general.

---

## 4. Endpoints

```
GET  /api/coaches/{id}/exceptions
     -- filtrable por ?category=, ?severity=, ?status= (default: status=pendiente)
     -- ordenado por severity (alta > media > baja) y luego created_at desc
POST /api/exceptions/{id}/resolve
     -- marca resuelta manualmente, resolved_by = coach autenticado
POST /api/exceptions/{id}/dismiss
     -- status=descartada (para "no es relevante", distinto de "ya lo resolví")
```

**Autorización:** mismo patrón ya usado en `SessionProgressionRuleController` — comparar `{id}` de la URL contra `auth()->id()`, sin prefijo `/admin` (no existe rol coach separado de admin en este esquema, confirmado en el MD de instalación).

**No crear endpoints nuevos para resolver automáticamente** los ítems de 3.3 y 3.5 — esos ya se resuelven dentro de los controladores existentes (`SessionProgressionRuleController`, el controlador de `adaptive_week_plans`), solo hay que añadir ahí la actualización del `coach_exception_item` asociado.

---

## 5. Servicio central

**`app/Services/CoachExceptionFeedService.php`** — un único método de creación reutilizado por todos los listeners, para no repetir la lógica de idempotencia (`unique(source_type, source_id)`) en cada sitio:

```php
createOrSkip(
    coachId, clientId, category, severity, 
    sourceType = null, sourceId = null, 
    title, description = null
) -> CoachExceptionItem|null
```

Devuelve `null` sin crear nada si ya existe un ítem `pendiente` con el mismo `source_type`+`source_id` — evita duplicados si un listener se dispara más de una vez (mismo criterio de idempotencia que `ProcessSessionInterpretation`).

---

## 6. Frontend (admin panel Next.js/shadcn)

- Vista de listado tipo bandeja, agrupada visualmente por severidad (alta arriba, con color distinto).
- Cada ítem debe permitir navegar directo al contexto real (cliente + ejercicio si aplica) sin que el coach tenga que buscarlo — usar los `client_id`/`exercise_id` disponibles en el ítem o en el modelo origen.
- Acciones rápidas desde el propio listado: para `sugerencia_carga` y `estancamiento`, poder aprobar/rechazar directamente desde el panel sin navegar al detalle completo (reutilizando los endpoints ya existentes de Fase 2), para no obligar a dos pasos.
- **No mostrar `inactividad` con el mismo peso visual que `dolor`** aunque ambos puedan tener severidad `media`/`alta` — mantener dolor siempre como la categoría visualmente más urgente, independientemente del orden numérico de severidad, dado que es la única con implicación de seguridad real.

---

## 7. Criterios de aceptación

- [ ] Un `pain_report` con intensidad 4+ genera un ítem `alta` visible en el panel en menos de lo que tarda el job asíncrono existente (no hay demora adicional introducida por esta feature).
- [ ] Aprobar o rechazar una sugerencia de carga desde el endpoint ya existente de Fase 2 marca automáticamente el ítem correspondiente como `resuelta`, sin acción manual duplicada del coach.
- [ ] Un readiness bajo un solo día no genera ítem; dos días consecutivos sí; si al tercer día vuelve a ser óptimo, el ítem se resuelve solo.
- [ ] Ningún listener genera un ítem duplicado si se dispara más de una vez para el mismo origen (`unique(source_type, source_id)` verificado con test).
- [ ] Un cliente `free` nunca genera ítems en el panel — el gate se comprueba en el mismo punto de entrada donde ya se comprueba para el resto del Motor (Fase 0), no se repite la lógica de gate dentro de `CoachExceptionFeedService`.
- [ ] El job de inactividad no confunde una semana adaptativa aprobada (sesiones reducidas a propósito) con sesiones perdidas — revisar que `program_day_assignment` de una semana ya ajustada no cuente como "perdida" si el cliente completó lo que sí tenía programado tras el ajuste.

---

## 8. Prompt para Claude Code

```
Implementar el Panel de Excepciones del coach según docs/Panel_Excepciones.md.

Antes de escribir cualquier migración:
1. Investiga si CommonNotification (ya usado para dolor y PRs) tiene ya 
   estructura de "bandeja" consultable persistente, o es solo push efímero. 
   Si ya existe algo equivalente a lo que este documento pide, dime qué 
   encontraste antes de crear una tabla nueva — puede que haya que extender 
   en vez de crear.
2. Revisa si ya existe alguna vista de dashboard/alertas de coach en el 
   admin panel Next.js, para no duplicar UI.
3. Confirma la relación coach-cliente real (User.coach_id + coach(), ya 
   añadida en la Fase 1 del Motor).

Produce una tabla de reconciliación como hiciste con progression_rules antes 
de continuar, y espera confirmación si encuentras alguna colisión relevante.

El resto de la implementación (tabla coach_exception_items, listeners por 
categoría, servicio CoachExceptionFeedService, endpoints, resolución 
automática al aprobar/rechazar sugerencias existentes) está detallado 
sección por sección en el documento. Sigue el mismo patrón de idempotencia, 
gate de paid-tier en el punto de entrada, y verificación aislada por bloque 
(sintaxis, migraciones, curl real con datos de prueba limpiados después) 
que usaste en la instalación del Motor.

La categoría "inactividad" es una versión mínima deliberada — no implementes 
el score de riesgo de abandono completo, eso es un feature aparte todavía 
sin especificar.
```

---

*Documento de implementación — Panel de Excepciones del Coach. Se apoya íntegramente en las Fases 1-4 del Motor de Auto-Regulación de Carga, ya construidas y verificadas (ver `Motor_Auto_Regulacion_Carga_Instalacion.md`).*
