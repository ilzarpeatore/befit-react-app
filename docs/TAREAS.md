# Tareas — Befit App (React Native)

Estado del trabajo de conexión backend/navegación, generado a partir de `docs/PANTALLAS.md` y las decisiones tomadas en esta ronda. Cada tarea pendiente indica el motivo y el endpoint/archivo relevante para retomarla sin tener que re-investigar desde cero.

---

## ✅ Completadas

### Navegación y autenticación
- **Fix del bug de registro**: eliminada la colisión de nombres de ruta (`WelcomeAuth`/`LoginAuth`/`RegisterFlow` duplicados entre los stacks "auth" y "onboarding" en `App.tsx`) que dejaba al usuario en un formulario de registro vacío tras un registro exitoso. Ahora navega correctamente a onboarding.
- **Fix de cleartext HTTP**: `android:usesCleartextTraffic="true"` en el manifest + `expo-build-properties`, para que los builds release no bloqueen las llamadas HTTP al backend local.
- **Home Modern como pantalla de inicio real**: la ruta `HomePage` del tab principal ahora renderiza `MigratedNavigator` (inicia en `MigratedHomeModern`, `pages/migrated/home_screen_modern.tsx`). El `Home.tsx` original quedó desconectado (import sin usar en `App.tsx`, ver pendiente #10).
- **Botón flotante "+"** (abre `ScreenExplorer`, listado de las 173 pantallas) disponible tanto en `Home.tsx` como en Home Modern.
- **Tarjetas de acceso real** añadidas: "Blog" y "Mi Programa" en Home, "Recetas y Nutrición" en el tab Today — antes esas pantallas solo eran alcanzables desde el menú de QA.
- **Saneamiento de `navigate("HomePage")` roto** en 5 pantallas migradas que no podían volver al tab Home real.
- **`initialRouteName` explícito** en los 3 stacks condicionales de `RootNavigator` y en `MigratedNavigator`, como defensa en profundidad frente a colisiones de nombres futuras.

### Calidad / bugs de UI
- Eliminado `Alert.alert('Blog Debug', ...)` olvidado en `blog_screen.tsx` que mostraba datos internos de la API en cada carga del blog.
- Corregido el bug de scroll de Home Modern: `onScrollEndDrag` forzaba una recarga completa del dashboard (con spinner de pantalla completa) en cada gesto de scroll, impidiendo desplazarse por la pantalla.

### Documentación
- **`docs/PANTALLAS.md`**: catálogo completo de las 173 pantallas (archivo, ruta, nombre visible, APIs usadas, módulo backend real o sugerido).

### Conexión de APIs (esta ronda)
- **`exercise_history_screen.tsx`**: cambiado de `exercisesApi.getList` (catálogo general) a `exercisesApi.getUserExercises` (`GET get-user-exercise`) — ahora muestra los ejercicios que el usuario realmente registró, no el catálogo completo.
- **`post_details_screen.tsx`**: botones de like/bookmark conectados a `postsApi.like` / `postsApi.bookmark`, con actualización optimista y reversión si la llamada falla.
- **`schedule_screen.tsx`**: eliminado el concepto de "horarios de clase pagados" (reserva + pantalla de pago, sin sentido sin clases reales). El calendario semanal ahora usa el endpoint real `v1/my-calendar` (mismo que "Mi Programa").
- **`api/recipes.ts`**: tipos corregidos para coincidir con el backend real (`recipe_image` en vez de `image`, sin `description` inventado, paginación `currentPage`/`totalPages`), y se agregó `getDetail(id)` (`GET recipe-detail/{id}`, faltante).
- **`api/exercises.ts`**: mismo fix de paginación (`totalPages` en vez de `total_pages`), tipos de paginación agregados a `getBodyParts`/`getEquipment`/`getLevels`/`search`.
- **4 pantallas de recetas conectadas** a la API real (antes usaban stubs locales que devolvían arrays vacíos/mock):
  - `recipe_main_screen.tsx` → `recipesApi.getTags/getCategories/getFilteredList`
  - `recipe_category_list_screen.tsx` → `recipesApi.getCategories`
  - `recipe_tag_list_screen.tsx` → `recipesApi.getTags`
  - `recipe_list_screen_v2.tsx` → `recipesApi.getFilteredList` (con todos los filtros que soporta el backend: meal_type, categorías, tags, rangos de calorías/macros, tiempo de preparación, favoritos)
- **`search_screen.tsx`** conectada a `exercisesApi.search/getByEquipment/getByLevel/getEquipment/getLevels` (antes stubs locales vacíos).
- **Efecto colateral corregido**: al arreglar la paginación de `api/exercises.ts`, apareció el mismo bug preexistente en `exercise_list_screen.tsx` (no estaba en el alcance original, se corrigió al vuelo para no romper el build).

---

## 🔜 Pendientes, por prioridad

### Alta prioridad (recetas + entrenamiento — foco actual declarado)
1. **UI de filtros en `recipe_list_screen_v2.tsx`**: la llamada a `recipesApi.getFilteredList` ya soporta todos los filtros del backend (meal_type, macros, categoría, tag), pero la interfaz de selección sigue siendo un placeholder ("Filter options placeholder"). Falta construir la UI que rellene esos parámetros.
2. **View Body Parts / View Equipment / View Level** (`pages/migrated/view_body_part_screen.tsx`, `view_equipment_screen.tsx`, `view_level_screen.tsx`, categoría "Migrated - Exercise"): mismo patrón que `search_screen.tsx` antes del fix — llamadas a API comentadas como TODO. Los endpoints ya existen y están listos en `api/exercises.ts` (`getBodyParts`, `getEquipment`, `getLevels`), es una conexión directa y de bajo esfuerzo.
3. **Verificar acciones interactivas dentro de las pantallas de recetas ya conectadas**: confirmar que los botones de "favorito" y "añadir a plan diario" (si existen en `recipe_main_screen.tsx`/`recipe_list_screen_v2.tsx`) llaman realmente a `recipesApi.setFavourite` / `recipesApi.saveDailyPlanRecipe` — la conexión de esta ronda se centró en la carga de listados/detalle, no se auditaron explícitamente esos botones de acción.

### Prioridad media
4. **Recordatorios de salud** (`water_reminders_screen.tsx`, `meals_reminders_screen.tsx`, `meals_water_reminder_screen.tsx`, `set_reminder_screen.tsx`, `reminder_screen.tsx`): conectar a `POST set-reminder-settings` (`UserController::setReminderSetting`, ya existe y funciona — guarda `water_reminder_settings`/`meal_reminder_settings` en el perfil).
5. **OTP / Verify OTP** (`otp_screen.tsx`, `verify_otp_screen.tsx`): login alternativo por SMS. Backend disponible en `social-otp-login` (`UserController::socialOTPLogin`), no conectado todavía. Solo necesario si se quiere ofrecer login sin contraseña.
6. **Menú lateral de `Home.tsx`** (Mi Perfil, Favoritos, Configuración general, Apple Health, Smart Watch, Community, Logout): no está replicado en Home Modern. Decidir si se migra ese menú a Home Modern o se agrega un acceso equivalente, ya que esas opciones dejaron de ser alcanzables para el usuario real.

### Baja prioridad / diferido explícitamente por decisión de producto
7. **Suscripciones y pagos** (`Subscribe`, `Subscription Detail`, `Payment`, `Payment Scheduled`): módulo `api/subscription.ts` completo y listo, pero **no se va a integrar por ahora** (decisión explícita).
8. **Conexión con wearables** (`Emparejando`, `Device Connected`, `Link Device Choice`, `Link Device List`): pura simulación local, sin endpoint de "device pairing" en el backend. Se abordará más adelante, según lo planteado.
9. **Pantallas de video** (`Video Screen`, `Video Detail`, `YouTube Player`, `Chewie Player`): no existe ningún módulo de video en `routes/api.php`. Pendiente decidir si se construye ese backend o se elimina esta sección de la app.

### Limpieza técnica (opcional, bajo riesgo, no bloqueante)
10. Import muerto `import Home from "@pages/Home"` en `App.tsx` (el componente ya no está conectado a ninguna ruta activa).
11. Decidir el destino de `pages/Home.tsx` (el Home original): ¿se elimina del repo o se mantiene como referencia/rollback?
