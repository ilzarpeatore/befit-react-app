# Pantalla de Detalle de Ejercicio (4 pestañas) — Especificación completa

## Ruta del proyecto
```
C:\Users\hamza\Desktop\PROYECTOS\APP\BeFit react\React App\pages
```

No se especifica paleta de colores — mantener la estética ya usada en el
resto del proyecto (fondo oscuro, texto claro, acentos verdes, según las
capturas de referencia).

---

## 1. Estructura de componentes recomendada

```
pages/
  ExerciseDetailScreen.tsx        (contenedor principal, gestiona scroll + tabs activa)
  components/
    ExerciseMediaHeader.tsx       (imagen/vídeo con colapso por scroll)
    ExerciseFeedbackRow.tsx       (pulgar arriba/abajo)
    ExerciseTabBar.tsx            (barra de 4 pestañas)
    tabs/
      MuscleTab.tsx
      InstructionsTab.tsx
      EquipmentTab.tsx
      AnalysisTab.tsx
        AnalysisHistoryCard.tsx   (una tarjeta por sesión pasada)
```

Estado que vive en `ExerciseDetailScreen.tsx` (contenedor):
- `activeTab: 'muscle' | 'instructions' | 'equipment' | 'analysis'`
- `exerciseDetail` (respuesta de la API, con estados `loading`/`error`/`data`)
- `scrollY` (valor animado, `Animated.Value` o `useSharedValue` de
  `react-native-reanimated`, ya presente en el proyecto)

---

## 2. Cabecera con media — comportamiento de scroll, exacto

- Altura inicial de la zona de media: **45% del alto de pantalla**
- Altura mínima al colapsar del todo: **0** (la media desaparece
  completamente, no se queda un remanente)
- Rango de scroll sobre el que ocurre la transición: de `0` a
  `HEADER_HEIGHT` (se colapsa exactamente lo que se ha desplazado, 1:1,
  sin easing adicional — comportamiento "sticky-collapse" clásico)
- Implementación: `Animated.ScrollView` con el offset de scroll
  interpolado hacia la altura del header, usando `extrapolate: 'clamp'`
- Los dos iconos flotantes (atrás / favorito) permanecen **fijos en
  posición absoluta respecto a la pantalla completa**, no respecto a la
  media — siguen visibles y en el mismo sitio incluso cuando la media ya
  colapsó del todo
- El panel de contenido (badges, título, tabs, contenido de pestaña) vive
  en un `ScrollView` normal por debajo — no se anima su posición, solo
  ocupa el espacio que la media va dejando libre

---

## 3. Panel de contenido — bloque fijo antes de las pestañas

1. **Fila de badges**: badge del grupo muscular principal (mayúsculas,
   forma píldora) + badge opcional de popularidad ("MUY POPULAR"), color
   de acento distinto entre los dos

2. **Título**: grande (32-36px), negrita, sin límite de líneas (puede
   ocupar 2, no se trunca)

3. **Fila de feedback**:
   - Texto a la izquierda: "¿Cómo te gustaría que te recomendemos este
     ejercicio?" (permite 2 líneas)
   - 2 botones circulares a la derecha (pulgar arriba / pulgar abajo),
     tamaño fijo (48x48)

   **Comportamiento decidido**: al pulsar cualquiera de los dos, se
   guarda una preferencia explícita del cliente sobre este ejercicio
   (like/dislike), para sesgar a futuro recomendaciones automáticas de
   sustitución de ejercicios. Toggle: pulsar el ya activo lo desmarca.
   Solo uno activo a la vez. Cambia de color/relleno al estar activo.

   **Backend — endpoint nuevo, sencillo**:
   ```
   POST /api/v1/exercise-feedback
   Body: { exercise_id, client_id, feedback: 'like' | 'dislike' | null }
   ```
   Tabla nueva y mínima `client_exercise_feedback` (client_id,
   exercise_id, feedback, timestamps, único por cliente+ejercicio). Solo
   persistir el dato — no construir ningún motor de recomendación ahora.

4. **Barra de 4 pestañas**: contenedor píldora, la activa con fondo
   resaltado interior — mismo patrón que otras barras de pestañas ya
   existentes en el proyecto, si las hay.

---

## 4. Endpoint base — contrato de datos exacto

```
GET /api/v1/exercise-detail?id={exercise_id}
```

Respuesta esperada (ajustar nombres si el backend ya devuelve algo
similar con otro nombre, pero esta es la forma a construir si no existe):

```
{
  "data": {
    "id": 123,
    "title": "Prensa de pecho inclinada en máquina",
    "media_url": "https://.../prensa-pecho.mp4",
    "media_type": "video",
    "is_popular": true,
    "muscle": {
      "primary": { "name": "Pectorales", "icon_url": "https://.../pectoral.png" },
      "secondary": [
        { "name": "Tríceps", "icon_url": "https://.../triceps.png" },
        { "name": "Hombros", "icon_url": "https://.../hombros.png" }
      ]
    },
    "instructions": {
      "steps": [
        "Sientate en el banco con los pies planos en el suelo.",
        "Coloque las manos en la plataforma con los codos flexionados.",
        "Realiza el movimiento empujando la plataforma hasta que tus codos esten completamente extendidos.",
        "Regreso de manera controlada"
      ],
      "tips": [
        "Evita mover excesivamente los hombros hacia adelante.",
        "Manten el abdomen contraido.",
        "Evite usar el impulso o movimientos bruscos."
      ]
    },
    "equipment": {
      "name": "Maquina press de pecho",
      "image_url": "https://.../maquina-press-pecho.jpg"
    },
    "user_feedback": null
  }
}
```

**Estados a manejar (para todo el bloque, no solo por pestaña)**:
- `loading`: skeleton o spinner centrado sobre el panel de contenido
- `error`: mensaje de error + boton "Reintentar"
- `data`: renderiza normalmente

---

## 5. Pestaña MUSCULO

- Seccion "PRINCIPAL" (mayusculas): fila con icono cuadrado (silueta con
  zona resaltada, 64x64) + nombre del musculo principal
- Seccion "SECUNDARIA": mismo patron, repetido por cada musculo
  secundario
- Separador fino entre filas

**Estado vacio**: si no hay musculos secundarios, omitir la seccion
"SECUNDARIA" por completo (sin mensaje).

---

## 6. Pestaña INSTRUCCIONES

- Lista numerada: numero a la izquierda (ancho fijo), texto de la
  instruccion a la derecha, separador fino entre pasos
- Seccion colapsable "CONSEJOS IMPORTANTES": cabecera con icono de
  flecha que rota al expandir/contraer, contenido en lista con vineta.
  **Estado inicial: contraido**.

**Estado vacio**: si no hay pasos, mostrar "Aun no hay instrucciones
disponibles para este ejercicio." Si no hay consejos, omitir esa seccion
por completo.

---

## 7. Pestaña EQUIPAMIENTO

- Imagen cuadrada (96x96, fondo blanco) + nombre al lado

**Estado vacio**: si no hay equipamiento asociado, mostrar "Este
ejercicio no requiere equipamiento".

**Backend pendiente**: no existe aun gestion de imagenes de equipamiento
en el panel Admin (a diferencia de Musculo). Si `equipment.image_url`
viene vacio, usar un placeholder generico sin bloquear el resto de la
pantalla por esto.

---

## 8. Pestaña ANALISIS — la pieza funcional nueva

### 8.1 — Endpoint nuevo (backend)

```
GET /api/v1/exercise-history?exercise_id={id}&client_id={id}
```

Respuesta:
```
{
  "data": {
    "exercise_id": 123,
    "total_sessions": 4,
    "sessions": [
      {
        "date": "2026-07-21",
        "workout_title": "PIERNA - Mesociclo Julio",
        "sets": [
          { "set_number": 1, "reps": 12, "carga": 40, "rpe": 8 },
          { "set_number": 2, "reps": 10, "carga": 45, "rpe": 8.5 },
          { "set_number": 3, "reps": 8, "carga": 45, "rpe": 9 }
        ],
        "prs_this_session": ["carga_maxima"]
      },
      {
        "date": "2026-07-14",
        "workout_title": "PIERNA - Mesociclo Julio",
        "sets": [
          { "set_number": 1, "reps": 12, "carga": 35 },
          { "set_number": 2, "reps": 10, "carga": 40 }
        ],
        "prs_this_session": []
      }
    ]
  }
}
```

**Importante — claves dinamicas por metricas**: cada objeto dentro de
`sets` solo lleva las claves habilitadas ese dia en concreto
(`enabled_metrics` en el momento del registro). El frontend debe leer
las claves presentes en cada objeto, no asumir siempre reps/carga fijos.

**Construccion del backend**: consulta agregada sobre la tabla de logs
ya existente (`client_exercise_logs` o equivalente tras la migracion),
filtrando por exercise_id + client_id, agrupando por fecha de sesion,
orden descendente. Cruzar con `personal_records` para poblar
`prs_this_session`. No crear ninguna tabla nueva de logs — los datos ya
existen, esto es solo una consulta de lectura agregada.

### 8.2 — Estructura visual

- Si `total_sessions` es 0: mensaje centrado "Aun no hay datos", sin
  nada mas debajo
- Si hay sesiones: lista de tarjetas (`AnalysisHistoryCard`), una por
  sesion, orden mas reciente primero:
  - Fila superior: fecha formateada a la izquierda, `workout_title` en
    texto secundario a la derecha
  - Si `prs_this_session` no esta vacio: badge "PR" en la esquina
  - Tabla de series con columnas dinamicas segun las claves presentes
    en `sets` de esa sesion en concreto
  - Separador entre tarjetas

### 8.3 — Estados
- `loading`: skeleton de 2-3 tarjetas
- `error`: mensaje + boton "Reintentar"
- `data` con 0 sesiones: "Aun no hay datos"
- `data` con sesiones: lista de tarjetas

---

## 9. Orden de construccion y verificacion

1. `ExerciseMediaHeader` + scroll — verificar aislado primero
2. Bloque fijo (badges + titulo + feedback + tabs) — conectar
   `exercise-feedback` y verificar que el toggle persiste tras recargar
3. Pestaña MUSCULO — confirma que `exercise-detail` funciona de base
4. Pestaña INSTRUCCIONES — verificar la animacion de expandir/contraer
5. Pestaña EQUIPAMIENTO
6. Pestaña ANALISIS — construir y probar el endpoint backend antes de
   conectar el frontend

No pasar al siguiente paso sin confirmar visualmente en el dispositivo
real que el paso anterior funciona con datos reales del backend.

---

## 10. Reglas generales

1. No inventar campos de la API que no se hayan confirmado — si el
   backend actual no devuelve algo de lo aqui descrito, añadirlo
   siguiendo exactamente esta forma, no aproximarla.
2. La tabla `client_exercise_feedback` y el endpoint de historial
   agregado son las UNICAS piezas de backend genuinamente nuevas de este
   documento — musculo, instrucciones y equipamiento con alta
   probabilidad ya existen parcial o totalmente desde el import
   original de ejercicios.
3. Reutilizar componentes ya existentes del proyecto (tarjetas, badges,
   barras de pestañas) en vez de crear versiones nuevas desde cero.
