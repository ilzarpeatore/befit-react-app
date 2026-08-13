# Score de Riesgo de Abandono + Alerta de Silencio (20 días)
### Especificación de implementación

Indicador compuesto por cliente que combina inactividad, caída de compliance, ausencia de logros recientes y señal de dolor recurrente, para priorizar en el Panel de Excepciones a los clientes con mayor riesgo real de abandono — no solo a los que tienen un problema técnico puntual (dolor, sugerencia pendiente), sino a los que están dejando de comprometerse sin que nadie lo note todavía.

**Reemplaza** la versión mínima de la categoría `inactividad` construida en el Panel de Excepciones (7 días / 2 sesiones perdidas) — esa versión queda documentada como paso intermedio ya superado por esta especificación completa.

---

## 0. Investigación previa (obligatoria antes de escribir migraciones)

1. **Revisar si existe ya algún campo de "última actividad" en `User`** (ej. `last_active_at`, `last_login_at`) que pudiera servir como señal adicional de inactividad más allá de sesiones completadas — si no existe, documentarlo como limitación conocida (ver §2.1) en vez de inventar tracking nuevo de apertura de app en esta iteración.
2. **Revisar si ya existe una tabla de configuración por coach reutilizable** (ej. algo equivalente a pesos configurables, si `ReadinessCalculationService` guarda sus pesos en tabla o en config estática) — si el patrón ya existe, reutilizar la misma estructura para los pesos de este score en vez de crear un mecanismo de configuración distinto.
3. **Confirmar la query real usada para `hito_compliance`** en `achievement_events` (Fase 3 del Motor) — ese cálculo de sesiones completadas vs. programadas en ventana ya existe y debe reutilizarse aquí, no reimplementarse.
4. Producir tabla de reconciliación antes de continuar, mismo criterio que en features anteriores.

---

## 1. Componentes del score

Cuatro señales, todas calculables con datos que **ya existen** en el sistema (ninguna requiere captura nueva):

| Componente | Fuente | Qué mide |
|---|---|---|
| `dias_inactividad` | `workout_session_reviews.completed_at` (más reciente por cliente) | Días desde la última sesión completada — el predictor más fuerte según datos de mercado |
| `compliance_declive` | `program_day_assignments` vs `workout_session_reviews`, misma query que `hito_compliance` (Fase 3) | Diferencia de % de cumplimiento entre las últimas 4 semanas y las 4 anteriores |
| `dias_desde_ultimo_logro` | `achievement_events.created_at` (más reciente por cliente) | Tiempo sin ningún evento positivo mostrado al cliente |
| `senal_dolor` | `pain_reports` (últimos 30 días) | Frecuencia e intensidad de molestias reportadas — proxy de fricción/frustración hasta que exista clasificación de feedback textual (fuera de alcance aquí) |

---

## 2. Normalización de cada componente (a escala 0–1, donde 1 = máximo riesgo)

### 2.1 `dias_inactividad_norm`

```
SI dias_inactividad < 7        → 0.0
SI dias_inactividad entre 7-19 → escala lineal 0.0 → 0.7
SI dias_inactividad >= 20      → 1.0 (fijo, no continúa escalando)
```

**Regla de negocio explícita y no configurable:** si `dias_inactividad >= 20`, la banda final del cliente es **siempre `alto`**, sin importar el resto de componentes — no se combina con el peso, se aplica como override directo (mismo patrón que el bloqueo por dolor en el motor de progresión: una condición que gana sobre el cálculo ponderado). Esto refleja el dato de mercado que motivó esta feature (68% más probabilidad de cancelar tras 20 días de silencio) y evita que un cliente en riesgo real quede diluido por otros componentes que pinten bien.

**Limitación conocida a documentar en código:** `dias_inactividad` se basa en sesiones completadas, no en apertura de la app — si `User.last_active_at` no existe (confirmar en §0.1), un cliente que abre la app y navega sin entrenar no se detecta como activo. Aceptable para esta iteración, documentado como mejora futura.

### 2.2 `compliance_declive_norm`

```
compliance_actual = % sesiones completadas últimas 4 semanas
compliance_anterior = % sesiones completadas 4 semanas antes de esas
declive = compliance_anterior - compliance_actual  (puede ser negativo si mejoró)

SI declive <= 0                → 0.0 (no hay declive, o mejoró)
SI declive entre 0-40 puntos   → escala lineal 0.0 → 1.0
SI declive > 40 puntos         → 1.0
```

**Cold start:** si el cliente lleva menos de 8 semanas en el programa (no hay ventana "anterior" completa), no calcular este componente — excluir del promedio ponderado, no rellenar con 0 ni con 1 (mismo criterio de redistribución de pesos ya usado en `ReadinessCalculationService`).

### 2.3 `ausencia_logro_norm`

```
SI dias_desde_ultimo_logro < 14 → 0.0
SI dias_desde_ultimo_logro entre 14-45 → escala lineal 0.0 → 1.0
SI dias_desde_ultimo_logro > 45 → 1.0
SI el cliente nunca tuvo ningún achievement_event → usar dias desde 
   fecha_inicio de su primera asignación de programa como base del cálculo
```

**Cold start:** si el cliente lleva menos de 14 días desde su primera asignación, no calcular este componente — es normal no tener logros todavía, no es señal de riesgo.

### 2.4 `senal_dolor_norm`

```
dolor_score = SUM(intensidad de cada pain_report en los últimos 30 días) / 5
   (normalizado por el máximo de intensidad posible)

SI dolor_score = 0             → 0.0
SI dolor_score entre 0-3       → escala lineal 0.0 → 1.0
SI dolor_score > 3             → 1.0
```

---

## 3. Combinación ponderada

```
combined_score = w1*dias_inactividad_norm 
               + w2*compliance_declive_norm 
               + w3*ausencia_logro_norm 
               + w4*senal_dolor_norm
```

**Pesos por defecto** (configurables por coach, ver §0.2 sobre dónde guardarlos — reutilizar patrón existente si lo hay):

```
w1 (inactividad)      = 0.40
w2 (compliance)        = 0.25
w3 (ausencia_logro)    = 0.20
w4 (dolor)              = 0.15
```

**Redistribución si falta un componente** (cold start de 2.2 o 2.3): igual que en `ReadinessCalculationService`, redistribuir proporcionalmente el peso del componente ausente entre los disponibles, nunca rellenar con 0 ni con un valor neutro.

## 4. Bandas finales

```
SI dias_inactividad >= 20        → banda = alto  (override, ver §2.1, ignora combined_score)
SI NO, y combined_score >= 0.6   → banda = alto
SI NO, y combined_score >= 0.3   → banda = medio
SI NO                            → banda = bajo
SI no hay datos suficientes para ningún componente → banda = dato_insuficiente
```

---

## 5. Modelo de datos

### Tabla nueva: `retention_risk_scores`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `client_id` | FK → `users` | |
| `date` | date | |
| `dias_inactividad` | unsignedInteger, nullable | |
| `compliance_actual` | decimal(5,2), nullable | |
| `compliance_anterior` | decimal(5,2), nullable | |
| `dias_desde_ultimo_logro` | unsignedInteger, nullable | |
| `dolor_score` | decimal(6,2), nullable | |
| `combined_score` | decimal(6,4), nullable | |
| `band` | enum (`RiskBand`): `bajo`, `medio`, `alto`, `dato_insuficiente` | |
| `calculated_at` | timestamp | |

`unique(client_id, date)` — mismo criterio de idempotencia que `readiness_scores` (Fase 4 del Motor).

### Enum nuevo

`RiskBand` (`app/Enums/`), mismo patrón PHP 8.1+ que el resto del sistema.

### Reutilización de configuración de pesos

Si en §0.2 se confirma que existe una tabla reutilizable de pesos por coach (patrón de `ReadinessCalculationService`), añadir ahí las 4 columnas de pesos de este score. Si no existe ninguna, crear `coach_score_weight_configs` genérica (`coach_id`, `score_type` enum `readiness`/`retention_risk`, columnas de pesos) que sirva para ambos scores en vez de crear dos tablas de configuración paralelas — decisión a tomar en la fase de reconciliación, no asumir de antemano.

---

## 6. Servicio y job

**`app/Services/RetentionRiskCalculationService.php`** — job diario, mismo patrón que `ReadinessCalculationService`:

```
Comando: retention-risk:calculate
Kernel.php: ->dailyAt('07:00')  (después de readiness:calculate a las 06:00, 
                                   no depende de él pero evita solapar carga)
```

Lógica del job, por cada cliente `paid-tier` con coach asignado:
1. Calcular los 4 componentes (§2), aplicando reglas de cold start donde corresponda.
2. Combinar con pesos del coach (§3), con redistribución si falta algún componente.
3. Aplicar override de `dias_inactividad >= 20` (§2.1) antes de asignar banda final.
4. Guardar en `retention_risk_scores` (`updateOrCreate` por `client_id`+`date`, idempotente).
5. Si `band` es `alto` o `medio` → generar/actualizar `coach_exception_item` (ver §7). Si `band` es `bajo` → si existía un ítem abierto de `category=riesgo_abandono` para ese cliente, marcarlo `resuelta` automáticamente (mismo patrón de auto-resolución que readiness bajo en el Panel de Excepciones).

**Gate `paid-tier`** comprobado dentro del job antes de incluir un cliente, mismo patrón que `ReadinessCalculationService`.

---

## 7. Integración con el Panel de Excepciones (ya construido)

- Nueva categoría en `ExceptionCategory`: `riesgo_abandono`.
- Mapeo de severidad: `band=alto` → `severity=alta`; `band=medio` → `severity=media`. `band=bajo`/`dato_insuficiente` no genera ítem.
- Usar `CoachExceptionFeedService::createOrSkip()` ya existente, con `source_type=RetentionRiskScore`, `source_id=retention_risk_score.id` del día — **pero con una diferencia respecto al resto de categorías**: aquí sí interesa que se actualice el ítem existente día a día (no solo idempotencia de "no duplicar"), porque el riesgo puede subir de `medio` a `alto` y el coach debe verlo reflejado. Extender `CoachExceptionFeedService` con un método `updateOrCreate` equivalente para esta categoría, o revisar si el ítem del día anterior debe resolverse y crearse uno nuevo — decidir el patrón más simple de mantener (recomendado: un ítem "vivo" por cliente para esta categoría, actualizado in-place mientras el riesgo se mantenga `medio`/`alto`, en vez de un ítem nuevo por día).
- `title` sugerido: incluir el componente dominante (ej. "Riesgo alto — 22 días sin entrenar" si `dias_inactividad` es el driver, o "Riesgo medio — compliance bajó 35 puntos" si el declive de compliance es el mayor contribuyente) — el coach necesita saber **por qué** sin abrir el detalle.

### Deprecación de la versión mínima anterior

El job `check:client-inactivity` construido en la primera versión del Panel de Excepciones queda **sustituido** por esta feature. Eliminar el comando y su entrada en `Kernel.php`, y migrar/cerrar cualquier `coach_exception_item` de la categoría `inactividad` antigua que siga `pendiente` (marcarlos `resuelta` con nota indicando que fueron reemplazados por `riesgo_abandono`).

---

## 8. Notificación push al cliente (reenganche)

Hasta ahora todo lo definido notifica **al coach** (vía Panel de Excepciones). Esto añade un canal directo **al cliente**, para intentar reenganchar antes de que el coach tenga que intervenir manualmente — pero con control estricto de frecuencia y tono, porque un mensaje mal calibrado puede acelerar el abandono en vez de evitarlo.

### 8.1 Principio de diseño

- **Escalones progresivos, no un único aviso a los 20 días.** Para cuando el cliente lleva 20 días de silencio, ya es tarde para una notificación automática — el momento de intervenir es antes. Se definen 3 etapas.
- **Nunca más de un mensaje por etapa por episodio de inactividad.** Un episodio termina en cuanto el cliente completa una sesión — si vuelve a caer en inactividad después, es un episodio nuevo y las etapas se reinician solas (ver §8.4, no requiere lógica de reset explícita).
- **Tono:** recordatorio cercano, nunca culpabilizador ni con lenguaje de urgencia/culpa ("llevas X días sin entrenar, no abandones"). Mensaje orientado a facilitar la vuelta, no a señalar la ausencia.
- **El coach puede desactivar este canal automático** si prefiere gestionar el reenganche siempre personalmente a través del Panel de Excepciones — no debe ser obligatorio.

### 8.2 Etapas

| Etapa | `dias_inactividad` | Tono del mensaje | Objetivo |
|---|---|---|---|
| `dia_7` | ≥ 7 | Suave, informativo | Recordatorio de que su próxima sesión está esperando, sin más |
| `dia_14` | ≥ 14 | Cercano, ofrece ajuste | Sugerir activar modo vida real / plan adaptativo si la semana ha sido complicada (enlaza con la feature ya construida) |
| `dia_20` | ≥ 20 | Cercano, menciona al coach | Avisa que su coach también ha sido notificado y puede ayudar a reajustar el plan — no es solo un bot insistiendo |

**Plantillas de texto** (versión inicial, sin sistema de plantillas configurable — eso es la feature "plantillas de mensaje por evento" del roadmap general, fuera de alcance aquí):

```
dia_7:  "¿Todo bien? Tu próxima sesión te está esperando cuando quieras retomarla."
dia_14: "Si esta temporada está siendo complicada, puedes ajustar tu semana 
         directamente desde la app — no hace falta que sea todo o nada."
dia_20: "Tu entrenador también lo sabe y está para ayudarte a retomarlo como 
         mejor te encaje."
```

Guardar como constantes en el servicio, no hardcodeadas inline, para facilitar ajuste futuro sin tocar lógica.

### 8.3 Modelo de datos

**Tabla nueva: `client_retention_nudges`**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `client_id` | FK → `users` | |
| `stage` | enum (`RetentionNudgeStage`): `dia_7`, `dia_14`, `dia_20` | |
| `episode_reference_date` | date | La fecha de la última sesión completada antes de que empezara este episodio de inactividad — identifica el episodio (ver §8.4) |
| `sent_at` | timestamp, nullable | |
| `channel` | enum: `push` (único canal por ahora, dejar el enum abierto a `email`/`sms` futuros) | |
| `status` | enum: `enviado`, `fallido` | |

`unique(client_id, stage, episode_reference_date)` — evita reenviar la misma etapa dentro del mismo episodio, incluso si el job se reejecuta.

### 8.4 Por qué `episode_reference_date` resuelve el reset sin lógica adicional

El "episodio de inactividad" se identifica por la fecha de la última sesión completada. Si el cliente entrena y vuelve a caer en inactividad más adelante, esa fecha de referencia cambia — y como el `unique` incluye `episode_reference_date`, las 3 etapas quedan libres de nuevo para ese nuevo episodio automáticamente, sin necesidad de un job de "reset" separado ni de borrar filas antiguas.

### 8.5 Configuración por coach

Añadir `auto_reengagement_enabled` (boolean, default `true`) a la misma tabla de configuración de pesos ya definida en §5 (o donde se resuelva en la investigación previa de §0.2) — si el coach lo desactiva, el job calcula igualmente `retention_risk_scores` y alimenta el Panel de Excepciones con normalidad, simplemente no dispara notificaciones al cliente.

### 8.6 Integración con el job existente

Dentro de `RetentionRiskCalculationService`, después de calcular `dias_inactividad` por cliente y **antes** de aplicar el resto de la lógica de score compuesto:

```
stage = determinar_etapa(dias_inactividad)  // null si <7 días
SI stage no es null 
   Y coach.auto_reengagement_enabled = true 
   Y no existe ya client_retention_nudges para (client_id, stage, episode_reference_date):
      enviar push (reutilizar servicio de push ya existente para el cliente, 
                    ver §0 — investigar antes de crear uno nuevo)
      registrar en client_retention_nudges
```

**Investigación previa adicional para esta sección:** confirmar si ya existe un servicio de push notification hacia el cliente (separado de `CommonNotification`, que según el MD de instalación del Motor se usa para notificar al coach) — por ejemplo, si ya hay recordatorios de sesión programada vía Expo push. Reutilizar ese mecanismo, no crear un segundo sistema de push paralelo.

### 8.7 Endpoint de configuración

```
PUT /api/coaches/{id}/retention-settings
    -- body: { auto_reengagement_enabled: bool }
```

---

## 9. Endpoints (resumen completo)

```
GET /api/coaches/{id}/retention-risk-summary
    -- lista de clientes del coach ordenada por combined_score desc, 
       incluyendo band y componente dominante
GET /api/coaches/{id}/clients/{clientId}/retention-risk
    -- detalle + histórico (serie temporal de retention_risk_scores 
       para ver evolución, útil para que el coach vea si algo que hizo 
       ayudó a bajar el riesgo)
PUT /api/coaches/{id}/retention-risk-weights
    -- actualizar w1-w4, validar que sumen 1.0 (o normalizar automáticamente 
       si no suman exactamente 1.0)
PUT /api/coaches/{id}/retention-settings
    -- activar/desactivar auto_reengagement_enabled (§8.5)
```

Autorización: mismo patrón ya usado en el resto del Motor (`coach_id = auth()->id()`, sin prefijo `/admin`).

---

## 10. Criterios de aceptación

- [ ] Un cliente con 20+ días sin sesión completada siempre queda en banda `alto`, incluso si el resto de componentes son óptimos.
- [ ] Un cliente nuevo (<14 días) no genera falso positivo por `ausencia_logro_norm` ni por `compliance_declive_norm` — ambos se excluyen del cálculo, no se rellenan con valor de riesgo.
- [ ] Si faltan 2 de los 4 componentes por cold start, el peso se redistribuye correctamente entre los 2 restantes (deben sumar el peso total, no quedarse en 0.55 de un total de 1.0).
- [ ] Un cliente que mejora de `alto` a `bajo` en un día resuelve automáticamente su `coach_exception_item` sin acción manual del coach.
- [ ] El ítem del panel se actualiza in-place día a día para esta categoría (no se acumulan 5 ítems distintos para el mismo cliente en una semana de riesgo sostenido).
- [ ] Un cliente `free` nunca genera `retention_risk_scores` ni ítems asociados.
- [ ] El job es idempotente: reejecutarlo el mismo día no duplica filas (`unique(client_id, date)` + `updateOrCreate`).
- [ ] Un cliente en día 7 recibe exactamente 1 push, no uno por cada ejecución diaria del job mientras siga en esa etapa.
- [ ] Si el cliente entrena y vuelve a caer en inactividad después, recibe de nuevo el mensaje de `dia_7` cuando corresponda — el episodio anterior no bloquea el nuevo.
- [ ] Un coach con `auto_reengagement_enabled = false` no genera ningún push al cliente, pero `retention_risk_scores` y el Panel de Excepciones siguen funcionando con normalidad.
- [ ] Un cliente `free` nunca recibe estas notificaciones (mismo gate que el resto de la feature).

---

## 11. Prompt para Claude Code

```
Implementar el Score de Riesgo de Abandono compuesto y la sustitución de la 
alerta mínima de inactividad, según docs/Score_Riesgo_Abandono.md.

Antes de escribir migraciones:
1. Revisa si User tiene ya algún campo de última actividad (last_active_at o 
   similar). Si no existe, no lo crees en esta iteración — documenta la 
   limitación en el código y sigue solo con datos de sesiones completadas.
2. Revisa cómo ReadinessCalculationService guarda o define sus pesos 
   configurables (tabla, config estática, etc.) y reutiliza el mismo patrón 
   para los pesos de este score en vez de crear un mecanismo distinto. Si 
   tiene sentido, propón una tabla de configuración de pesos genérica 
   compartida entre ambos scores (readiness y retention_risk) en vez de dos 
   tablas paralelas — decide y documenta el porqué.
3. Reutiliza exactamente la query que ya usa achievement_events para 
   hito_compliance (Fase 3 del Motor) para calcular compliance_actual y 
   compliance_anterior — no la reimplementes desde cero.

El resto de la lógica (normalización de los 4 componentes, override de 
20 días, combinación ponderada, cold start, job diario, integración con 
coach_exception_items incluyendo la actualización in-place del ítem en vez 
de duplicar por día) está detallado sección por sección en el documento.

Importante: esta feature SUSTITUYE el job check:client-inactivity construido 
en la versión mínima anterior del Panel de Excepciones. Elimínalo de 
Kernel.php y cierra (status=resuelta, con nota) cualquier coach_exception_item 
de categoría 'inactividad' que siga pendiente, indicando que fueron 
reemplazados por la categoría 'riesgo_abandono'.

Además, implementa las notificaciones push de reenganche al cliente (§8): 
antes de crear un servicio de push nuevo, investiga si ya existe alguno 
usado para recordatorios de sesión u otras notificaciones al cliente 
(distinto de CommonNotification, que es hacia el coach) y reutilízalo. 
Las 3 etapas (dia_7/dia_14/dia_20), el control de duplicados vía 
episode_reference_date, y el toggle por coach para desactivarlo están 
detallados en esa sección — sigue el texto de los mensajes tal cual, sin 
añadir lenguaje de urgencia o culpa.

Sigue el mismo patrón de verificación aislada por bloque que usaste en las 
fases anteriores del Motor: sintaxis limpia, migración corrida, curl real 
con datos de prueba (cliente con 20+ días sin sesión, cliente con compliance 
en caída, cliente nuevo con <14 días) y limpieza de esos datos después.
```

---

*Documento de implementación — Score de Riesgo de Abandono + Alerta de Silencio. Se apoya en las Fases 1-4 del Motor de Auto-Regulación de Carga y en el Panel de Excepciones, ambos ya construidos y verificados.*
