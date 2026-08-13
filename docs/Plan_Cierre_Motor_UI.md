# Plan — Cerrar el círculo del Motor de Auto-Regulación (UI + reporte de dolor + avisos)

### Contexto

El Motor de Auto-Regulación (4 fases) y el Panel de Excepciones están construidos y verificados a nivel de datos/API, pero **nada en el admin ni en la app deja actuar sobre lo que el motor genera**, salvo el panel de excepciones (que solo permite resolver/descartar como bookkeeping, no aprobar/editar/rechazar de verdad). Este plan cierra ese círculo: decisiones ya tomadas con el usuario, no hace falta volver a preguntar.

**Decisiones confirmadas:**

1. Aviso proactivo al coach: **solo campana de notificaciones en el admin** (ya existe visualmente, hoy con datos mock) — no email, no OneSignal (roto, fuera de nuestro control hasta que haya credenciales reales).
2. Se incluye en este plan: fix del bug preexistente de `ReportController::coachingMetrics()` y activación del cron del scheduler en el VPS.

**Investigado antes de escribir este plan** (hechos reales verificados, no supuestos):

| Dónde                                 | Archivo real                                                 | Hallazgo                                                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Resumen de cliente                    | `admin/src/routes/Router.tsx:158-159` → `UserDetailView.tsx` | Tab `overview`, columna derecha (`lg:col-span-4`, línea ~762) con tarjetas apiladas: perfil, Objetivos, Notas, **Limitaciones** (con `AlertTriangleIcon`, mismo lenguaje visual que necesitamos) |
| Dashboard general                     | `admin/src/views/dashboard/index.tsx`                        | Renderiza `StatCard`, `KpiSection`, `CoachingMetricsCard`, `LibraryBreakdown`, `RecentActivity`                                                                                                  |
| Patrón de "lista de pendientes"       | `admin/src/components/dashboard/RecentActivity.tsx`          | `DashboardCard` + `Tabs`/`TabsContent` + `Table`, alimentado por `RecentItem[]` — reutilizable tal cual para excepciones                                                                         |
| Sesión de entrenamiento (app)         | `pages/migrated/workout_session_screen.tsx` (1060 líneas)    | Cero menciones de dolor. Header de cada ejercicio (línea ~618-636) con `openExerciseInfo(ex)` + chevron — sitio natural para un botón nuevo                                                      |
| `POST /api/sessions/{id}/pain-report` | —                                                            | **Nunca llamado desde la app**, confirmado con grep en todo el repo                                                                                                                              |
| OneSignal                             | `config/services.php:33-35`, `.env`                          | `ONESIGNAL_APP_ID`/`ONESIGNAL_REST_API_KEY` vacías                                                                                                                                               |
| Email                                 | `.env`                                                       | `MAIL_MAILER=smtp` con `MAIL_HOST` configurado — funcional, pero fuera de alcance por decisión del usuario                                                                                       |
| Campana del admin                     | `admin/src/layouts/full/vertical/header/Notifications.tsx`   | Componente real (`Bell` + `DropdownMenu`) pero alimentado por `NotificationData.Notification`, **datos mock estáticos**                                                                          |

---

## Fase 0 — Deuda técnica de infraestructura (prerrequisito, bajo riesgo)

Sin esto, nada de lo automático de ayer (ni lo de antes) corre nunca solo en producción.

- **Fix `ReportController::coachingMetrics()`** (`app/Http/Controllers/API/Admin/ReportController.php:385`): `User::role(['coach'])` lanza `RoleDoesNotExist` porque el rol Spatie `coach` no existe para el guard `web`. Investigar primero (no asumir el fix): comprobar en qué guard están realmente registrados los roles Spatie en este proyecto (`php artisan tinker` → `Spatie\Permission\Models\Role::all()`) y corregir la llamada al guard correcto, o sustituir por `User::where('user_type','coach')` (mismo criterio ya usado en `CoachExceptionItemController::adminCoachOptions()` y en todo el Motor) si resulta más simple y consistente — decisión técnica a tomar en el momento según lo que se encuentre, priorizando consistencia con el resto del código ya construido.
- **Activar el scheduler** (`* * * * * cd /var/www/testapp && php artisan schedule:run >> /dev/null 2>&1` en el crontab de `www-data`, **no root** — lección ya aprendida ayer). Antes de dejarlo corriendo en bucle:
  1. Ejecutar cada comando afectado **a mano una vez** (`sudo -u www-data php artisan check:pain-patterns`, `readiness:calculate`, `check:mesocycle-closures`, `check:client-inactivity`, `check:habit-streaks`, `check:subscription`, `check:subscription-expiring`, `progression:apply-fallbacks`, `progression:check-recalibration`) y revisar `storage/logs` tras cada uno — varios de estos **nunca han corrido contra datos reales de producción**, es la primera vez que se ejecutan de verdad.
  2. Solo si todos corren limpios, instalar el cron.
  3. Verificar al día siguiente que `storage/logs` no tiene errores nuevos y que se generaron filas reales (ej. `readiness_scores` de hoy).

---

## Fase 1 — Endpoints admin para actuar de verdad sobre sugerencias y semanas adaptativas

Hoy `SessionProgressionRuleController::approve/edit/reject` y `AdaptiveWeekPlanController::approve` solo aceptan auth self-service (`coach_id === auth()->id()`), inalcanzable desde el login de staff del admin — por eso el panel de excepciones no puede ofrecer "aprobar" de verdad todavía.

- `POST /admin/session-progression/suggestions/{id}/approve|edit|reject` — mismo criterio ya usado para `/admin/coach-exceptions/{id}/resolve|dismiss`: sin comparar `coach_id` contra `auth()->id()` (staff actúa en nombre del coach). Reutilizar la lógica real de `SessionProgressionRuleController` (extraer a métodos protegidos reutilizables o llamar directamente a las mismas piezas privadas vía un pequeño refactor — decidir al implementar cuál genera menos duplicación) en vez de reescribirla.
- `POST /admin/adaptive-week-plans/{id}/approve` — mismo patrón, para `AdaptiveWeekPlanController`.
- Ambos con la misma verificación rigurosa ya aplicada al resto del Motor (`php -l`, curl real con datos de prueba limpiados después).

---

## Fase 2 — UI: sugerencias y excepciones en los 2 sitios que pediste

### 2.1 — Dashboard general (`/dashboard`) — todos los clientes

Nueva tarjeta (mismo componente base que `RecentActivity.tsx`: `DashboardCard` + `Tabs` + `Table`), añadida a `views/dashboard/index.tsx` junto a las ya existentes. Pestañas por categoría o por severidad (a decidir visualmente al construir, probablemente por severidad para que "dolor" salte primero). Fuente de datos: el mismo endpoint `/admin/coach-exceptions` ya construido, sin `coach_id` fijo — para el dashboard general hace falta que ese endpoint pueda listar de **todos los coaches a la vez** (hoy exige `coach_id` obligatorio) — se añade como parámetro opcional, con el mismo criterio de agrupación.

### 2.2 — Resumen de cliente (`/users/:id/resumen`) — un cliente concreto

Nueva tarjeta en la columna derecha de `UserDetailView.tsx`, junto a "Limitaciones" (mismo lenguaje visual, `AlertTriangleIcon`). Fuente: `/admin/coach-exceptions?client_id=X` — el endpoint ya filtra por `coach_id`, se añade filtro opcional por `client_id` para este uso (sin tener que pasar por el selector de coach, ya se sabe de qué cliente se trata desde la URL de la página).

### 2.3 — Acciones inline en ambas tarjetas

- `sugerencia_carga`: botones Aprobar / Editar / Rechazar (Fase 1) — mostrando `proposed_weight`/`proposed_reps`/`proposed_exercise_id` (sustitución) para que el coach decida sin tener que abrir nada más.
- `semana_adaptativa_pendiente`: botón Aprobar (Fase 1) — mostrar el resumen de `adaptive_week_plans.details` (sesiones mantenidas/recortadas) para decidir con contexto.
- Resto de categorías: Resolver / Descartar (ya existente, sin cambios).

**Fuera de alcance explícito de este plan** (no lo pediste, lo dejo anotado para que decidas después si hace falta): una pantalla para que el coach **cree/edite reglas de progresión nuevas** (`session_progression_rules`) sigue sin existir — hoy las reglas solo se pueden crear vía API directa. Este plan solo cubre **actuar sobre lo que el motor ya propuso**, no diseñar reglas nuevas desde el admin.

---

## Fase 3 — Reportar dolor desde la app (cliente)

- Nuevo componente bottom sheet "Reportar dolor" (reutilizar `components/SimpleBottomSheet.tsx`, ya existente en el proyecto), disparado desde un botón nuevo en el header de cada ejercicio de `workout_session_screen.tsx` (junto al chevron/`openExerciseInfo`, línea ~618-636).
- Campos, calcados del schema real de `pain_reports` (sin inventar nada nuevo): `tipo` (molestia_leve / dolor_agudo / dolor_que_empeora_durante_sesion), `localización` (lista corta de zonas corporales), `intensidad` (1-5), `momento` (al_iniciar/durante_ejecucion/al_finalizar/al_dia_siguiente — inferible por defecto según si el cliente ya registró series de ese ejercicio en la sesión actual, con opción de corregirlo a mano).
- Conecta a `POST /api/sessions/{id}/pain-report`, **ya existe y ya funciona** (verificado en la sesión anterior) — solo falta la UI y la llamada desde `api/`.
- Confirmación honesta al cliente tras enviar: si el reporte cumple `blocksProgression()` (intensidad≥4 o tipo≠molestia_leve), mostrar "Hemos avisado a tu entrenador" — cierra el círculo con lo que el backend ya hace de verdad (notifica al coach + genera el ítem de excepción), sin prometer nada que no pase.

---

## Fase 4 — Campana de notificaciones real en el admin

- `admin/src/layouts/full/vertical/header/Notifications.tsx` deja de usar `NotificationData` (mock) y pasa a consumir un endpoint real.
- Backend: endpoint ligero `GET /admin/coach-exceptions/unread-summary` (o reutilizar `/admin/coach-exceptions` con `status=pendiente` y mapear en frontend) — decidir al implementar si conviene un endpoint dedicado (más barato, solo conteo+últimos N) o reutilizar el ya existente.
- Alcance acordado: **solo campana**, sin email ni push — el coach se entera cuando tiene el admin abierto, no fuera de él.

---

## Fase 5 — Verificación (mismo rigor de siempre)

- `php -l` en cada archivo backend tocado/nuevo.
- `npx tsc --noEmit` en admin tras cada cambio de frontend.
- Curl real contra producción con tokens de prueba creados y revocados después, para los endpoints admin nuevos (Fase 1, 2.1, 2.2, 4).
- Prueba real en dispositivo (o al menos en emulador/build de desarrollo) del flujo de reportar dolor en la app — es UI nueva de cliente, no basta con `tsc`.
- `md5sum` VPS↔mirror local en todo lo tocado, igual que en las 2 rondas anteriores.
- **Todos los comandos en el VPS como `www-data`, nunca como `root`** — lección de la ronda anterior, aplicada desde el principio esta vez.

---

## Orden de ejecución recomendado

```
Fase 0 (independiente, primero — desbloquea todo lo automático)
  │
  ├── Fase 1 (backend, necesario antes de Fase 2)
  │     └── Fase 2 (frontend admin: dashboard + resumen de cliente)
  │           └── Fase 4 (campana — reutiliza los mismos datos de Fase 2)
  │
  └── Fase 3 (independiente, frontend app — puede ir en paralelo a 1/2/4)

Fase 5 en cada fase, no solo al final.
```

---

_Plan de implementación — pendiente de ejecución. Documento vivo: actualizar con hallazgos reales según se construya cada fase, mismo criterio que `Panel_Excepciones_Implementacion.md`._
