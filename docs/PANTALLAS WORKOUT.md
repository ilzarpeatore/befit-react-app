# Pantallas de Workout — Preview y Sesión en Marcha (React Native/Expo)

## Ruta del proyecto

```
C:\Users\hamza\Desktop\PROYECTOS\APP\BeFit react\React App\pages
```

Las dos pantallas nuevas van dentro de esta carpeta, siguiendo la
convención de nombres/estructura que ya usen los archivos existentes ahí
dentro.

## Contexto

Dos pantallas nuevas, en React Native (Expo), reemplazando/complementando
el flujo de entrenamiento actual. **No se especifica paleta de colores en
este documento a propósito** — usa la que ya tenga definida el proyecto o
una neutra provisional; el foco aquí es estructura, layout y
comportamiento exacto, no estética de color.

Conectar a los endpoints ya documentados en
`Especificacion_Completa_Funcionalidades.md` — no inventar ninguno nuevo
sin confirmar antes que no existe ya.

---

## PANTALLA 1 — "Workout Preview" (antes de empezar)

### Estructura visual, de arriba a abajo

1. **Imagen de cabecera a sangre completa** (full-bleed, ocupa el ancho
   entero de la pantalla, altura aprox. 40% del alto visible)
   - Icono de flecha "atrás" (chevron-left) superpuesto arriba a la
     izquierda, sobre la propia imagen, con fondo semitransparente
     circular

2. **Título** (justo debajo de la imagen, fuera de ella):
   - Texto grande, negrita, puede ocupar 2 líneas
   - A la derecha del título (misma fila, alineado arriba): 2 botones
     icono circulares — uno de "guardar/carpeta", otro de "favorito"
     (estrella outline)

3. **Fila de metadatos**, cada uno en su propia línea, con icono a la
   izquierda + texto:
   - Icono de rayo + nivel de dificultad (ej. "Avanzado")
   - Icono de reloj + duración estimada (ej. "70 minutos")
   - Icono de nodos/conexión + contexto de equipamiento (ej. "Gimnasio
     Grande")

4. **Cabecera de sección**: texto "N EJERCICIOS" en mayúsculas, negrita
   (N = número real de ejercicios del Workout)

5. **Lista de ejercicios** (scrolleable, ocupa el resto del espacio):
   - Cada fila: imagen cuadrada del ejercicio (fondo blanco) con una
     insignia pequeña superpuesta en la esquina inferior derecha de esa
     imagen (silueta muscular con la zona trabajada resaltada — reutilizar
     el mismo asset/patrón visual que ya exista en el proyecto para esto)
   - Junto a la imagen: nombre del ejercicio (negrita, puede ocupar 2
     líneas), debajo subtítulo con formato **"{sets} series de {reps}
     reps"**
   - Separador fino entre filas

6. **Botón fijo inferior** (sticky, siempre visible aunque se haga scroll
   de la lista): texto "INICIAR ENTRENAMIENTO" en mayúsculas, ancho
   completo con márgenes laterales, forma de píldora (bordes muy
   redondeados)

### Comportamiento
- Al pulsar "INICIAR ENTRENAMIENTO" → navega a la **Pantalla 2**, pasando
  el `program_day_assignment_id` (o `workout_template_id`, según cuál
  aplique en el flujo actual de la app) como parámetro de navegación

### Conexión a API
```
GET /api/v1/workout-template-detail?id={id}
```
(o el endpoint de detalle equivalente que ya use `FullWorkoutScreen` en
la antigua app Flutter — `C:\Users\hamza\Desktop\PROYECTOS\APP\mightyfitness\mightyfitness_flutter` —
revisar `training_api_service.dart` ahí como referencia exacta del
contrato de datos, ya que esta pantalla React debe mostrar la misma
información).

Campos usados: título del Workout, imagen (si existe alguna asociada, si
no, imagen genérica), nivel/dificultad, duración estimada, contexto de
equipamiento, lista de ejercicios con su `sets`/`reps` prescritos.

---

## PANTALLA 2 — "Sesión en marcha" (tras pulsar Iniciar)

Es **una sola pantalla scrolleable**, con dos zonas: el ejercicio activo
(expandido, con tabla de registro) arriba, y el resto de ejercicios en
formato acordeón colapsado debajo. Solo un ejercicio está expandido a la
vez.

### Zona superior (fija, no colapsable)

1. **Cabecera**: icono ✕ (cerrar) a la izquierda, nombre del día
   (ej. "Lunes") centrado, icono de menú (tres puntos) a la derecha

2. **Fila de 3 estadísticas en vivo**, separadas en columnas iguales:
   - Punto verde + cronómetro corriendo, formato `MM:SS`, etiqueta
     "Duración" debajo
   - Número de calorías estimadas (puede quedarse en 0 si no se calcula
     todavía), etiqueta "Calorías" debajo
   - Volumen acumulado en kg (suma de peso×reps de todas las series ya
     marcadas), etiqueta "Volumen (kg)" debajo

3. **Fila de conteo + acción**: "N EJERCICIOS" a la izquierda (mayúsculas,
   negrita), enlace de texto "Añadir ejercicio +" a la derecha

### Ejercicio activo (expandido) — el bloque principal

1. **Cabecera del ejercicio**: imagen cuadrada + insignia de músculo
   superpuesta (mismo patrón visual que en Pantalla 1), nombre del
   ejercicio (negrita, 2 líneas si hace falta), subtítulo
   "{sets} series • {reps} reps", icono de menú (tres puntos) a la
   derecha de esta cabecera

2. **Campo "Añadir nota..."** — placeholder de texto libre, guarda al
   perder el foco

3. **Tabla de series — DINÁMICA, no columnas fijas** (esto es importante,
   cambia según el ejercicio):

   El backend ya permite marcar, **por cada ejercicio**, qué métricas se
   deben registrar (campo `enabled_metrics`, un array — ej.
   `["reps", "carga", "rpe"]` para un ejercicio, pero
   `["reps", "carga", "rir", "tempo"]` para otro). Las métricas posibles
   vienen del catálogo ya existente en el backend (`metrics_catalog`):
   reps, carga/peso, RIR, RPE, tempo, tiempo (time), y las que ya estén
   dadas de alta ahí.

   **La tabla debe construirse leyendo ese array por cada ejercicio, no
   asumir nunca una lista fija de columnas.** Columnas a mostrar:
   - Siempre: número de serie
   - Luego, **una columna por cada valor presente en
     `enabled_metrics` de ESE ejercicio en concreto**, en el orden en que
     vengan
   - Cada columna es un input editable, del tipo que corresponda (numérico
     para reps/carga/RIR/RPE, formato de texto o selector para tempo si
     así lo maneja ya el backend — confirmar el formato exacto de
     `tempo`/`time` antes de asumir cómo se edita)
   - Botón de check a la derecha, igual que antes, para marcar la serie
     como completada

   **Importante**: como cada ejercicio del mismo Workout puede tener un
   conjunto de métricas distinto, la tabla debe **reconstruirse
   dinámicamente al cambiar de ejercicio activo** (al expandir uno
   distinto en el acordeón) — no reutilizar las mismas columnas de un
   ejercicio a otro.

4. **Botón fijo "✓ FINALIZAR ENTRENAMIENTO"** (píldora, ancho completo) —
   visible mientras se hace scroll dentro de este bloque

5. Debajo del botón de finalizar: dos acciones en la misma fila —
   "+ AÑADIR SERIE" (añade una fila nueva a la tabla) y "MARCAR TODAS LAS
   SERIES" con icono de doble-check (marca todas las filas como
   completadas de golpe)

### Acordeón de los demás ejercicios (colapsados)

Debajo del bloque anterior, un separador, y luego **una fila por cada
ejercicio restante del Workout** (no el activo):
- Misma miniatura + insignia de músculo que en el resto de la app
- Nombre del ejercicio + subtítulo "{sets} series • {reps} reps"
- Icono de menú (tres puntos) a la derecha
- **Al tocar la fila** (en cualquier punto que no sea el icono de menú) →
  esta fila se convierte en el "ejercicio activo" (se expande a la vista
  completa de tabla de series descrita arriba), y el que estaba activo
  antes **se colapsa** a este mismo formato de fila resumen. Solo uno
  expandido a la vez.

### Comportamiento general de la pantalla
- El cronómetro de "Duración" corre en tiempo real desde que se entra a
  esta pantalla
- Al pulsar "FINALIZAR ENTRENAMIENTO" → confirmar (diálogo simple), y si
  se confirma, enviar el registro final y volver a la pantalla anterior
  (o a un resumen, si ya existe una pantalla de resumen post-entrenamiento
  en el proyecto — revisar antes de crear una nueva)

### Conexión a API

**Al marcar una serie como completada** (icono de check en la tabla):
```
POST /api/v1/{endpoint-de-logSets-ya-existente}
```
body: `{ workout_template_exercise_id, logged_sets: [{ ...valores según
enabled_metrics de ese ejercicio... }, ...] }` — el objeto de cada serie
debe llevar **solo las claves que ese ejercicio tenga habilitadas**
(ej. `{ reps, carga }` para uno, `{ reps, carga, rpe, tempo }` para otro),
nunca un objeto con todas las métricas posibles rellenando con `null` las
que no apliquen. Revisar `training_api_service.dart` (`logSets()`) y el
backend (`enabled_metrics` en `workout_template_exercises`) para
confirmar el contrato exacto ya en uso, replicar el mismo formato.

**Al finalizar el entrenamiento**: confirmar si existe ya un endpoint de
"cerrar sesión de entrenamiento" (relacionado con
`workout_session_reviews` en el backend) — si existe, llamarlo aquí; si
no, dejarlo anotado como pendiente en vez de inventar uno.

---

## Cómo integrarlo en el proyecto (antes de escribir nada)

**Antes de crear ningún archivo, investiga y confirma estos 4 puntos —
no asumas ninguno:**

1. **Estructura de carpetas**: localiza dónde viven las pantallas
   existentes del proyecto (ej. `screens/`, `app/`, `src/screens/`) y
   coloca las dos pantallas nuevas siguiendo ese mismo patrón y
   convención de nombres ya en uso.

2. **Sistema de navegación**: identifica si el proyecto usa **React
   Navigation** o **Expo Router** (u otro) — revisa `App.tsx`/`_layout.tsx`
   o el archivo de entrada principal para confirmarlo. Registra las dos
   pantallas nuevas siguiendo exactamente ese mismo mecanismo, no mezcles
   los dos sistemas.

3. **Manejo de estado**: revisa si el proyecto ya usa algo (Context,
   Zustand, Redux, MobX) para estado global. Para lo local de estas dos
   pantallas (qué ejercicio está expandido, valores de la tabla, el
   cronómetro) usa `useState`/`useEffect` estándar de React salvo que el
   patrón ya establecido en el proyecto sea otro — en ese caso, síguelo.

4. **Componentes reutilizables existentes**: antes de crear un botón,
   tarjeta, o icono nuevo, busca si ya existe un componente equivalente
   en el proyecto (carpeta tipo `components/`) y reutilízalo. Solo crea
   uno nuevo si de verdad no existe nada parecido.

## Orden de construcción y verificación

1. Construye **solo la Pantalla 1** completa
2. Verifica visualmente (Expo Go en el móvil real) que se ve y navega
   correctamente, con datos reales del endpoint de detalle
3. **Espera confirmación antes de continuar con la Pantalla 2**
4. Construye la Pantalla 2, con el mismo paso de verificación en el
   dispositivo real antes de darla por terminada



1. **No inventar endpoints** — si algo no está documentado, señalarlo
   como pendiente de confirmar en vez de asumir una forma de respuesta.
2. Reutilizar el mismo patrón de insignia de músculo/imagen de ejercicio
   que ya exista en otras pantallas del proyecto (no crear un asset o
   componente nuevo si ya hay uno).
3. La transición Pantalla 1 → Pantalla 2 debe pasar el identificador
   correcto (`program_day_assignment_id` si viene del calendario,
   `workout_template_id` si viene de una lista de plantillas suelta —
   confirmar cuál aplica según desde dónde se navegue).
4. Construir primero la Pantalla 1 completa y verificada, después la
   Pantalla 2 — no las dos a la vez.
