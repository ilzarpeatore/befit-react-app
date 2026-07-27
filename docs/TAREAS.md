# Tareas — Befit App (React Native)

Estado del trabajo de conexión backend/navegación. Cada tarea pendiente indica el motivo y el endpoint/archivo relevante para retomarla sin tener que re-investigar desde cero.

---

## ✅ Completadas

### Navegación y autenticación
- Fix del bug de registro (colisión de nombres de ruta que dejaba el formulario de registro vacío tras un registro exitoso).
- Fix de cleartext HTTP en builds release.
- Home Modern como pantalla de inicio real de la app.
- Botón flotante "+" (ScreenExplorer) disponible en Home y Home Modern.
- Tarjetas de acceso real a Blog, Mi Programa y Recetas/Nutrición desde Home y Today.
- Saneamiento de `navigate("HomePage")` roto en 5 pantallas migradas.
- **Menú de usuario en Home Modern**: Mi Perfil, Mis Favoritos, Configuración General, Apple Health/Smart Watch (toggles), Community, Cerrar sesión — migrado desde el `Home.tsx` original, mismo destino de rutas.

### Calidad / bugs de UI
- Eliminado `Alert.alert('Blog Debug', ...)` olvidado en `blog_screen.tsx`.
- Corregido el bug de scroll de Home Modern (`onScrollEndDrag` forzaba recarga completa en cada gesto).

### Documentación
- `docs/PANTALLAS.md`: catálogo de las 173 pantallas (archivo, ruta, nombre visible, APIs, módulo backend).

### Sección de Recetas y Nutrición — ahora funcional de extremo a extremo
- **Bug de datos crítico encontrado y corregido en el backend**: las **5276 recetas** de la tabla `recipes` tenían el campo `meal_type` guardado con doble codificación JSON (ej. `"[\"snacks\"]"` como string en vez de `["snacks"]` como array real). Esto rompía silenciosamente **todo** filtro por `meal_type` en `recipe-filter-list` (siempre devolvía 0 resultados), afectando cualquier pantalla o feature que filtrara recetas por tipo de comida — incluido el nuevo flujo de "agregar comida" al Daily Plan. Se corrigió con un script de una sola vez que re-normalizó las 5276 filas (verificado: 5276 arregladas, 0 fallos). Confirmado en dispositivo: el filtro y el buscador de "agregar comida" ya devuelven resultados reales.
- **Detalle de receta funcional**: al tocar una receta (en `recipe_main_screen.tsx` o `recipe_list_screen_v2.tsx`) se abre `diet_detail_screen.tsx` mostrando ingredientes reales (cantidad + nombre) e instrucciones numeradas paso a paso, obtenidos de `recipe-detail/{id}`. Verificado en dispositivo con una receta real ("Torta de pasas": macros, 8 ingredientes, 4 pasos de instrucción).
- **Filtros de recetas**: `recipe_list_screen_v2.tsx` tiene chips de tipo de comida (multi-select) y rango de calorías, conectados a `recipe-filter-list`.
- **4 pantallas de recetas conectadas** a la API real (antes stubs locales vacíos): Recipe Main, Recipe Category List, Recipe Tag List, Recipe List V2.
- **`search_screen.tsx`** (búsqueda de ejercicios) conectada a `exercisesApi` real.
- **View Body Parts / View Equipment / View Level** (filtros de ejercicio) conectadas a `exercisesApi.getBodyParts/getEquipment/getLevels`, con navegación a la lista de ejercicios filtrada.
- **`exercise_history_screen.tsx`**: usa `get-user-exercise` (ejercicios reales del usuario) en vez del catálogo general.
- **Pantalla original `RecipeDetail.tsx`** (ya conectada desde Daily Plan/Diet Dashboard/Diet List): tenía un bug de nombres de campo (`ingredient_name`/`preparation_methods` inexistentes) que dejaba ingredientes e instrucciones vacíos — corregido para usar los campos reales (`ingredient_title`, `recipe_steps[]`).
- **`pages/DailyPlan.tsx`**: tenía un bug más profundo de lo reportado — asumía una forma de respuesta (`data.meal_type[].recipe`) que no coincide con el backend real (`daily_plan_recipe: {breakfast: [...], lunch: [...]}`), lo que habría crasheado la pantalla en cuanto hubiera un plan real. Corregido el modelo de datos, y **agregado el flujo de "agregar comida"**: botón "+" por sección (Breakfast/Lunch/Dinner/Snacks) que abre un buscador de recetas reales y las agrega al plan (`save-daily-plan-recipe`). **Verificado en dispositivo de punta a punta**: búsqueda, selección y refresco automático del plan funcionan correctamente.
- **Dietas asignadas por el coach**: sí existe backend (`GET assign-diet-list`, antes no usado en ningún lado). Se agregó una sección "Assigned to Me" en `pages/DietDashboard.tsx`. Se corrigió además un bug de navegación (`DietDashboard.tsx` y `DietList.tsx` navegaban a `RecipeDetail` pasando el id de una Dieta, cuando esa pantalla espera un id de Receta — dos modelos distintos — ahora navegan correctamente a `MigratedDietDetail`).

### Recordatorios de salud y login por OTP
- `water_reminders_screen.tsx` y `meals_reminders_screen.tsx` conectadas a `POST set-reminder-settings` (guarda de verdad los horarios configurados en el perfil del usuario, y los precarga al entrar).
- `verify_otp_screen.tsx` conectada a `POST social-otp-login` (con el `login_type` corregido a `'mobile'`, el único valor real que el backend acepta).

### Pantallas de Dieta restantes — conectadas y verificadas en dispositivo
- **Diet Screen**: ya estaba 100% conectada (sin cambios necesarios).
- **Diet Screen Sandow**: conectada a `dietApi.getList/search` (mismo patrón que Diet Screen). Los chips de tipo de comida (Breakfast/Lunch/etc.) quedaron como filtro puramente visual — el modelo legacy "Diet" no tiene campo `meal_type` en el backend, solo `categorydiet_id`/`is_featured`/`is_premium`. De paso se corrigió un bug de paginación infinita que existía también en Diet Screen (nunca marcaba `isLastPage`).
- **View Diet Category**: conectada a `dietApi.getCategories`. El contador de "items" por categoría queda en 0 porque el backend (`CategoryDietResource`) no expone ese dato — no se inventó un número.
- **Favourite Recipe**: conectada a `recipesApi.getFavourite`. Al tocar una receta favorita navega al detalle real (ingredientes/instrucciones). **Verificado en dispositivo con datos reales**: se marcó "Torta de pasas" como favorita desde el detalle de receta y apareció correctamente en esta pantalla (el estado vacío que se veía antes era correcto — la cuenta de prueba no tenía ningún favorito guardado todavía, no era un bug).

### Bugs reales encontrados tras el reporte de que estas pantallas "seguían sin funcionar" (verificado con logcat en dispositivo)
- **Crash confirmado en `daily_plan_recipe_list_screen.tsx`**: `TypeError: Cannot read property 'mealType' of undefined` al abrir la pantalla sin recibir `route.params` (por ejemplo, entrando directo desde el Screen Explorer en vez de desde "Plan Screen"). Corregido con destructuring seguro (`props.route.params ?? {}`, `mealType` con default `'breakfast'`) y un fallback de fecha (`date` a la fecha de hoy en vez de string vacío, que hubiera creado un daily plan con fecha 1970-01-01 en el backend).
- **Bug de paginación sistémico en `api/diet.ts`**: el tipo `DietListResponse.pagination` declaraba campos en snake_case (`total_pages`/`current_page`) que **no existen** en la respuesta real del backend (que usa camelCase `totalPages`/`currentPage`, igual que el resto de la API). Esto rompía silenciosamente el scroll infinito (nunca cargaba la página 2) en **Diet Screen**, **Diet Screen Sandow** y `pages/DietList.tsx` — no crasheaba, solo se quedaba pegado en la primera página. Corregido el tipo y las 3 pantallas que lo consumían.
- **`view_all_diet.tsx` (pantalla real detrás de "View Diet Category" → tocar una categoría) estaba completamente sin conectar** — `getDietData` era 100% comentario, por eso SIEMPRE mostraba "No results found" sin importar el filtro (categoría, destacadas, asignadas o favoritas). Conectada a `dietApi.getList/getFavourite/getAssignedDiets` según el modo, corregido también un bug de paginación por closures obsoletos (`page` no incrementado antes del fetch) y el tap sobre un item (antes no navegaba a ningún lado, ahora abre `MigratedDietDetail`). Verificado en dispositivo con datos reales.
- **Plan Screen**: la versión rica del Daily Plan — metas de calorías/macros (calculadas del perfil del usuario), totales actuales, secciones por comida con recetas reales, checkbox de "marcar completado" y botón de vaciar plan. **Verificado en dispositivo de punta a punta**: marcar una receta como completada recalculó el total consumido correctamente (0 → 2000 kcal); agregar una receta desde "Daily Plan Recipe List" volvió automáticamente y refrescó los totales.
- **Daily Plan Recipe List**: buscador de recetas por tipo de comida para agregar al plan. Conectada a `recipe-filter-list`. **Verificado en dispositivo**: mostró recetas reales de desayuno y la selección se agregó correctamente al plan.
- Se agregó `recipesApi.updateDailyPlanRecipe` (nueva función, no reemplaza la existente) para soportar marcar/desmarcar completado sin romper otros usos de `saveDailyPlanRecipe`.

---

## 🔜 Pendientes, por prioridad

### Prioridad media
1. **`set_reminder_screen.tsx` / `reminder_screen.tsx`**: son recordatorios locales genéricos (nombre/descripción/día), pensados para notificaciones locales del dispositivo. **Bloqueado**: no existe librería de notificaciones locales instalada en el proyecto (`expo-notifications` no está en `package.json`) ni un endpoint CRUD de recordatorios individuales en el backend (solo existe `set-reminder-settings`, que solo acepta las claves agregadas de agua/comidas). Requiere decidir e instalar una librería de notificaciones locales antes de poder conectar esto de verdad.
2. **`otp_screen.tsx`**: no existe ningún endpoint de "enviar OTP" en el backend, ni el proyecto tiene Firebase Phone Auth instalado. Se reemplazó la alerta falsa por una navegación real a `verify_otp_screen`, pero el envío real del código sigue sin contraparte — requiere integrar un proveedor de SMS/Firebase o un endpoint dedicado a futuro.
3. **Daily Plan — "Daily Total" no se refresca tras agregar una comida**: al agregar una comida el resumen de macros por sección se actualiza correctamente, pero la tarjeta de "Daily Total" al final de la pantalla se vio en 0 kcal en la prueba en dispositivo — revisar si falta recalcular ese total tras el refresco o si depende de otro campo del backend que no se está reflejando.
4. **Daily Plan — caso "sin `daily_plan_id`" no verificado a fondo**: el backend crea el daily plan automáticamente en el primer `GET`, así que en la práctica no debería faltar, pero no se probó explícitamente el primer uso de un usuario que nunca tuvo un daily plan antes de esta fecha.

### Baja prioridad / diferido explícitamente por decisión de producto
5. **Suscripciones y pagos**: módulo `api/subscription.ts` completo y listo, pero no se va a integrar por ahora (decisión explícita).
6. **Conexión con wearables**: sin backend propio, se abordará más adelante.
7. **Pantallas de video**: no existe ningún módulo de video en `routes/api.php`. Pendiente decidir si se construye ese backend o se elimina esta sección.

### Limpieza técnica (opcional, bajo riesgo, no bloqueante)
8. Import muerto `import Home from "@pages/Home"` en `App.tsx`.
9. Decidir el destino de `pages/Home.tsx` (el Home original, ya sin ninguna ruta activa) — ¿eliminar o mantener como referencia?
10. `hooks/useDiet.ts` no se usa en ningún lado del proyecto — candidato a eliminar o a adoptarse como capa de datos real de las pantallas de diet.
