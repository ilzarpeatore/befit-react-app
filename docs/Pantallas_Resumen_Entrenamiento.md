# Pantallas de Resumen Post-Entrenamiento — Be Stronger App

Referencia visual: capturas de Hevy adjuntas (carrusel de 6 pantallas al terminar sesión).
Se replica la estructura del flujo, pero con identidad visual Be Stronger y el heatmap real
(`react-native-body-highlighter`) en lugar del gráfico radar de Hevy.

---

## 0. Contexto técnico

- Componente: `react-native-body-highlighter` (ya instalado)
- Se muestra como **carrusel horizontal swipeable** (`react-native-pager-view` o `FlatList` paginado), con dots de paginación abajo, igual que Hevy.
- Se dispara al completar/guardar un entrenamiento (mismo trigger que el modal actual de "sesión guardada").
- Data necesaria del backend por sesión completada:
  - `routine_name` (ej. "Mayo: Pierna A")
  - `duration_seconds`, `total_volume_kg`, `total_series`, `total_exercises`
  - `workout_number` (contador histórico del cliente, ej. "258")
  - Lista de ejercicios con: nombre, nº series, **lista de músculos trabajados** (para mapear al heatmap — usar el mismo mapping que ya tenemos en `client_exercise_overrides` / catálogo de ejercicios)
  - Volumen agregado por grupo muscular (para el heatmap por intensidad, no solo on/off)

---

## 1. Identidad visual (aplica a las 5 pantallas)

| Elemento           | Valor                                                                            |
| ------------------ | -------------------------------------------------------------------------------- |
| Fondo              | `#2e1f1f`                                                                        |
| Acento primario    | `#c47878`                                                                        |
| Texto principal    | `#ede8e2`                                                                        |
| Texto secundario   | `#c8bfb5`                                                                        |
| Headings           | DM Serif Display, italic                                                         |
| Body               | Inter                                                                            |
| Card               | fondo `#3a2828` (un tono más claro que el bg), `border-radius: 24`, padding `24` |
| Dots de paginación | activo `#c47878`, inactivos `#c8bfb5` al 30% opacidad                            |

Nada de blanco puro ni azul (Hevy usa blanco+azul, nosotros no). El heatmap por defecto pinta en azul — **hay que sobreescribir la paleta de colores del componente** para que use tonos de `#c47878` (del más claro al más oscuro según intensidad), nunca el azul default.

---

## 2. Cabecera fija (igual en las 6 pantallas, fuera del card)

Esto no cambia entre swipes — vive por encima del carrusel:

```
[icono confeti, círculo 64px, bg #3a2828]         ← alineado a la derecha, altura del título
"¡Bien hecho!"                                     ← DM Serif Display italic, 34px, #ede8e2
"Este es tu entrenamiento número {workout_number}" ← Inter, 17px, #c8bfb5
```

- Padding horizontal del contenedor completo: 24px
- Separación entre título y subtítulo: 8px
- Separación entre subtítulo y el card del carrusel: 24px

## 3. El card (contenedor de cada pantalla del carrusel)

Constante en las 6 pantallas, solo cambia el contenido interior:

- `background: #3a2828`
- `border-radius: 32px`
- `padding: 28px 24px`
- `min-height`: ~65% de la altura de pantalla (para que el botón "Ok" quede siempre fijo debajo, fuera del card, como en Hevy)
- Footer del card, SIEMPRE en las 6 pantallas, pegado abajo dentro del card:
  ```
  [logo Be Stronger, 24px alto]        "@bestronger"
  ```
  logo a la izquierda, handle a la derecha en Inter 15px `#c8bfb5`, misma fila (`justify-content: space-between`)

Debajo del card, fuera de él:

- Dots de paginación: 6 puntos, 8px diámetro, gap 6px, activo `#c47878` sólido, inactivos `#c8bfb5` al 25% opacidad
- Texto "Compartir rutina · Etiqueta @hevyapp" → cambiar a **"Compartir entrenamiento"** (sin etiqueta de terceros), Inter 14px `#c8bfb5`, centrado
- Fila de iconos de compartir (Fondo / Historias / Más / Descargar / Enlace / Copiar texto): mismos 6 iconos, círculos 56px bg `#3a2828`, icono `#ede8e2`, label debajo Inter 12px `#c8bfb5`
- Botón "Ok" fijo al fondo de la pantalla (fuera de todo lo anterior): full-width menos 24px de margen a cada lado, `background: #c47878`, texto `#2e1f1f` bold 17px, `border-radius: 16px`, altura 56px

---

## 4. Las 6 pantallas del carrusel, en orden

### Pantalla 1 — Dato motivacional (equivalente al "camión")

```
                    "Has levantado un total de"
                       10.690 kg   ← 56px, DM Serif italic, #c47878
                    "¡Eso es como levantar {referencia}!"
                    [ilustración simple, 200px alto]
```

- Todo centrado vertical y horizontalmente dentro del card
- Referencia: mantener el concepto de comparación con objeto cotidiano (camión, elefante, etc.) — puedes generar 3-4 variantes y que el backend elija según el rango de kg
- Ilustración: usar un icon set coherente con la paleta (línea/duotono en `#c47878` sobre `#2e1f1f`), no el emoji de camión de Hevy — si no hay ilustración custom lista, usar un ícono de Lucide (`Truck`, `Package`, etc.) en `#c47878` a 200px

### Pantalla 2 — Duración / Volumen / Series + mini-heatmap

```
   Duración        Volumen         Series
   0min             10.690 kg       13        ← valores 22px bold #ede8e2, labels 14px #c8bfb5, arriba de cada valor

              [heatmap frontal, silueta única, 180px alto]
```

- Fila de 3 stats arriba, alineados en columna cada uno (label arriba pequeño, valor abajo grande — igual que Hevy)
- Debajo, **heatmap frontal simplificado** (solo vista frontal, sin espalda) sustituyendo el radar de Hevy — mismo componente `react-body-highlighter`/`react-native-body-highlighter`, paleta `#c47878` en vez de azul
- Esta es la vista "resumen rápido" del heatmap; la vista completa frente+espalda va en la pantalla 6

### Pantalla 3 — Rutina + grid 2x2

```
"Mayo: Pierna A"    ← DM Serif italic, 26px, alineado a la izquierda arriba del card

   0min                10.690 kg
   Duración            Volumen

   4                   13
   Ejercicios          Series
```

- Título de rutina arriba a la izquierda (no centrado)
- Grid 2x2 debajo con mucho espacio vertical entre filas (~40px), números 34px bold `#ede8e2`, labels 15px `#c8bfb5` debajo de cada número
- Alineación: cada celda alineada a la izquierda (no centrada), igual que Hevy imagen 4

### Pantalla 4 — Rutina + stats en línea + lista de ejercicios (sin visual)

```
"Mayo: Pierna A"

Duración   Volumen   Series
0min       10.690 kg  13

3x  Extensión cuádriceps FSC
4x  Hack Squat FSC
3x  Sentadilla Multipower FSC
3x  Peso Muerto Sumo
```

- Título arriba a la izquierda
- Fila de 3 stats en formato compacto (label arriba 13px, valor debajo 18px bold), todo en una sola línea horizontal
- Lista de ejercicios debajo: el número de series en `#c47878` bold (20px) + nombre del ejercicio en `#ede8e2` (18px), una fila por ejercicio, separación 16px entre filas, sin separadores/líneas divisorias (limpio, solo espaciado)

### Pantalla 5 — Resumen condensado (versión "story", centrado)

```
                  0min
                 Duración

              10.690 kg
                Volumen

                  13
                Series
```

- Todo centrado horizontal y verticalmente, valores grandes (32px) y labels pequeños (14px) debajo de cada uno, con generoso espacio vertical entre bloques (~32px)
- Sin lista de ejercicios, sin heatmap — es la pantalla "limpia" pensada para compartir como story
- Logo + handle centrados también en esta pantalla (única excepción al footer estándar alineado izq/der — aquí van centrados, igual que Hevy imagen 6)

### Pantalla 6 — Rutina + lista de ejercicios + Heatmap completo ⭐

```
"Mayo: Pierna A"

3x  Extensión cuádriceps FSC
4x  Hack Squat FSC
3x  Sentadilla Multipower FSC
3x  Peso Muerto Sumo

        [heatmap frontal]   [heatmap posterior]
              lado a lado, 140px alto cada uno
```

- Título arriba a la izquierda
- Lista de ejercicios a la izquierda (mismo estilo que pantalla 4)
- Heatmap frontal + posterior a la derecha o debajo de la lista (según ancho disponible — en pantallas estrechas, apilar heatmaps debajo de la lista en vez de al lado)
- **Intensidad por volumen real**, no solo on/off:
  - Volumen bajo del grupo → `#c47878` @ 30% opacidad
  - Volumen medio → `#c47878` @ 65%
  - Volumen alto → `#a85f5f` (tono más saturado/oscuro) @ 100%
- Debajo del heatmap, línea pequeña con los grupos más trabajados: "Cuádriceps 42% · Glúteo 31% · Isquios 18%" (Inter 13px `#c8bfb5`)
- Esta es la pantalla "hero" del heatmap — la más completa de las 6

---

## 3. Navegación / interacción

- Swipe horizontal entre las 5, dots de paginación fijos abajo
- Botón "Ok" / "Cerrar" fijo en la parte inferior (fuera del carrusel, siempre visible) que cierra el modal y vuelve al home
- Opcional v2: botón compartir en pantalla 5 que genera imagen del card (usar `react-native-view-shot`) — no bloqueante para v1

---

## 4. Admin panel (Next.js)

Mismo componente `react-body-highlighter` (versión web) para una vista de **histórico agregado por cliente**: no por sesión individual, sino heatmap acumulado de volumen por grupo muscular en el mesociclo actual — útil para que tú como coach detectes desequilibrios (ej. confirmar que deltoide lateral y pectoral, que ya identificamos como grupos rezagados, están recibiendo suficiente volumen). Mismo esquema de color, mismo mapping de músculos que la app.

---

## 5. Encargo para Claude Code — orden de fases

1. Fase 1: Pantallas 1 y 2 (no dependen del heatmap, son solo layout + data ya existente)
2. Fase 2: Integrar heatmap en pantalla 3 con paleta sobreescrita + mapping ejercicio→músculo
3. Fase 3: Pantallas 4 y 5 + navegación por swipe completa
4. Fase 4 (opcional): vista agregada en admin panel

Aprobación explícita entre fases, como siempre.
