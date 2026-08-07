# Pantallas de Estadísticas — Be Stronger App

Referencia visual: capturas de Hevy (sección "Estadísticas" del perfil + 2 pantallas de detalle).
Se replica la estructura exacta, restyle completo a paleta Be Stronger. **No hay que tocar
cálculo de volumen/series/agregados por grupo muscular — eso ya está construido**; esto es
únicamente maquetación + binding a los endpoints que ya existen.

Reutiliza el componente de heatmap y la paleta ya definidos en `Pantallas_Resumen_Entrenamiento.md`
(`react-native-body-highlighter`, escala `#c47878` → `#a85f5f` por intensidad). No crear un
segundo componente de heatmap — es el mismo, con distinta fuente de datos.

---

## 0. Entrada — dónde vive esto

Nueva pantalla accesible desde el tab "Perfil" → botón/entrada "Estadísticas" (icono de gráfico).
Estructura de navegación: 1 pantalla principal + 2 sub-pantallas de detalle (push, no modal).

```
Estadísticas (principal)
 ├── Distribución de los músculos (radar comparativo)
 └── Distribución del cuerpo (heatmap + tabla por músculo)
```

Los otros 3 ítems del listado (Recuento de series, Ejercicios principales, Ejercicios de
clasificación, Informe mensual) se dejan como entradas de lista navegables — su detalle no es
parte de este encargo, solo necesitan estar en el listado y navegar a un placeholder/"Próximamente"
si aún no existe la pantalla destino.

---

## 1. Componentes reutilizados (ya definidos, no rehacer)

- **Card genérica**: bg `#3a2828`, border-radius 24px — igual que en el doc de resumen
- **Heatmap**: `react-body-highlighter` (web) / `react-native-body-highlighter` (app), paleta `#c47878` (bajo) → `#a85f5f` (alto), vista frontal + posterior lado a lado
- **Header con back button**: círculo 44px bg `#3a2828`, icono chevron-left `#ede8e2`, título centrado DM Serif Display italic

---

## 2. Pantalla principal — "Estadísticas"

### Header
```
(←)          "Estadísticas"          
```
- Back button izquierda, título centrado (DM Serif italic, 22px, `#ede8e2`), sin icono a la derecha en esta pantalla

### Sección 1 — Heatmap rápido (últimos 7 días)

```
"Gráfico corporal de los últimos 7 días"                    (?)
```
- Título Inter 16px semibold `#ede8e2`, icono de ayuda a la derecha: círculo 32px bg `#3a2828`, `?` en `#c8bfb5`
- Al tocar `(?)`: bottom sheet simple explicando qué significa la intensidad de color (reutilizar componente de bottom sheet ya usado en la app, `@gorhom/bottom-sheet`)

**Selector de días (strip horizontal, 7 elementos):**
```
 V      S      D      L      M      Mi     [J]
 31     1      2      3      4      5      6
```
- Cada día no-seleccionado: card `#3a2828`, border-radius 16px, ancho ~46px, altura ~64px — letra del día arriba (Inter 13px `#c8bfb5`), número debajo (Inter 20px bold `#ede8e2`)
- Día seleccionado: la card desaparece, el número queda dentro de un **círculo sólido `#c47878`** (46px diámetro), letra del día se mantiene arriba en `#c8bfb5`, número en `#2e1f1f` (contraste sobre el acento)
- Scroll horizontal si no caben los 7 en pantallas estrechas (no debería hacer falta, pero dejar preparado)
- Al tocar un día → recalcula el heatmap de abajo con la ventana de 7 días terminando en ese día (mismo comportamiento que Hevy)

**Heatmap:**
- Frontal + posterior lado a lado, ~200px alto cada uno, centrados
- Data: volumen agregado por grupo muscular en la ventana de 7 días seleccionada (usar el mismo endpoint/lógica que ya calcula el heatmap de la pantalla de resumen post-entrenamiento, pero agregando N sesiones en vez de 1)

### Sección 2 — "Estadísticas avanzadas"

- Header de sección: barra full-width bg `#241818`, padding 12px 24px, texto "Estadísticas avanzadas" Inter 14px `#c8bfb5`

**Lista de ítems** (row: icono 24px `#c8bfb5` + título + subtítulo + chevron, divisor `#3a2828` 1px entre filas, padding vertical 20px):

| Icono | Título | Subtítulo | Navega a |
|---|---|---|---|
| gráfico de líneas | Recuento de series por grupo de músculos | Número de series registradas para cada grupo muscular | placeholder / futuro |
| pentágono/radar | Distribución de los músculos | Compara la distribución actual y previa de tus músculos entrenados | **Pantalla 3 (radar)** |
| silueta persona | Distribución del cuerpo | Mapa semanal de músculos trabajados | **Pantalla 4 (heatmap+tabla)** |
| persona en podio | Ejercicios principales | Lista de los ejercicios que realizas con más frecuencia | placeholder / futuro |
| trofeo/podio | Marcas personales | Ranking de tus mejores marcas por ejercicio | placeholder / futuro |
| documento | Informe mensual | Resumen de tus entrenamientos y estadísticas del mes | placeholder / futuro |

- Nota: quitar el badge "PRO" de Hevy — Be Stronger no tiene ese gating (o si en el futuro quieres una capa premium, se añade después como una decisión de negocio aparte, no la mezcles con esta maquetación)

---

## 3. Sub-pantalla — "Distribución de los músculos" (radar comparativo)

### Header
```
(←)   "Distribución de los músculos"   (?)  (⬆ compartir)
```
- Back izquierda, título centrado, dos iconos a la derecha (ayuda + compartir/exportar), mismos círculos 32px `#3a2828`

### Selector de rango
- Pill dropdown: "Últimos 30 días" con chevron-down, bg `#3a2828`, border-radius 24px, padding 12px 20px, Inter 15px `#ede8e2`
- Al tocar: dropdown/bottom sheet con opciones (7 días, 30 días, 90 días, este mesociclo — este último es propio de Be Stronger, útil dado que tu programación es por mesociclos de 6 semanas, no algo que tenga Hevy)

### Radar chart
- Hexágono, 6 ejes en este orden (igual que Hevy): **Espalda** (arriba-izq) — **Pecho** (arriba-der) — **Piernas** (izq) — **Core** (der) — **Brazos** (abajo-izq) — **Hombros** (abajo-der)
- Grid lines: `#4a3838`, 4-5 anillos concéntricos
- Forma "Actual": fill `#c47878` @ 35% opacidad, stroke `#c47878` 2px sólido
- Forma "Anterior": fill `#c8bfb5` @ 12% opacidad, stroke `#c8bfb5` 2px, `stroke-dasharray` (discontinuo) para diferenciarla sin depender solo del color
- Librería: en RN usar `react-native-svg` con polígonos calculados a mano (no hay un radar-chart RN maduro y mantenido) o `victory-native`; en el admin (web) `recharts` `RadarChart` ya está disponible en el stack
- Leyenda debajo del chart, alineada a la derecha: `● Actual` (`#c47878`) `● Anterior` (`#c8bfb5`), Inter 14px

### Grid de 4 cards (2x2), debajo del chart
Cada card: `border: 1px solid #3a2828`, bg `#241818`, border-radius 20px, padding 20px

```
Entrenamientos          Duración
2                        1min
↑ 2                      ↑ 1min

Volumen                  Series
21k kg                   32
↑ 21k kg                 ↑ 32
```
- Label arriba (Inter 15px `#c8bfb5`), valor grande debajo (Inter 30px bold `#ede8e2`), delta vs. periodo anterior debajo en pequeño (Inter 14px)
- Color del delta: `#a8c99f` (verde apagado, coherente con la paleta oscura) si sube, `#d98c8c` (rojo apagado) si baja — nunca el verde/rojo saturado de Hevy, rompe la identidad

---

## 4. Sub-pantalla — "Distribución del cuerpo" (heatmap + tabla por músculo)

### Header
```
(←)   "Distribución del cuerpo"   (?)  (⬆ compartir)
```
Igual estructura que la pantalla anterior.

### Navegador de semana
```
‹     03-09 Agosto 2026     ›
```
- Centrado, Inter 16px `#ede8e2`, chevrons `#c8bfb5` a los lados, tappables para retroceder/avanzar semana

### Selector de días (mismo componente que la pantalla principal)
```
 L      M      Mi     [J]     V      S      D
 3      4      5      6       7      8      9
```
- Idéntico al de la sección 1 de la pantalla principal — reutilizar el mismo componente, no duplicar código

### Heatmap
- Frontal + posterior, mismo tamaño y paleta que en el resto de la app

### Tabla por músculo
- Header de tabla: fila bg `#241818`, "Músculo" (izq) / "Series" (der), Inter 14px `#c8bfb5` uppercase
- Fila "Total": Inter 17px bold `#ede8e2` (destaca del resto), separador `#3a2828` 1px debajo
- Resto de filas: nombre del músculo (Inter 16px `#ede8e2`) izq, nº de series (Inter 16px `#ede8e2`) der, padding vertical 16px, divisor `#3a2828` 1px entre filas
- Usar el listado de grupos musculares que ya existe en la taxonomía de MOVEBASE/catálogo de ejercicios (Abdominales, Abductores, Aductores, Antebrazos, Bíceps, Cardio, Cuádriceps, Deltoide, Dorsales, Espalda baja, Femorales, Glúteos, Isquiotibiales, Oblicuos, Pectoral, Tríceps, Trapecio — ajustar a los nombres exactos ya usados en el backend, no inventar nuevos)
- Scroll vertical si la tabla no cabe en pantalla (probable, hay ~17 grupos musculares)

---

## 5. Datos — qué necesita el backend exponer (probablemente ya existe, solo confirmar)

- Endpoint de heatmap por rango de fechas: `{ muscle_group: string, volume_kg: number, series: number }[]` — ya usado en pantalla de resumen post-entrenamiento, reutilizar con parámetro de rango en vez de una sola sesión
- Endpoint de comparación de periodos (radar): mismo agregado pero para 2 ventanas de tiempo (actual vs. anterior) agrupado en las 6 categorías macro (Espalda, Pecho, Piernas, Core, Brazos, Hombros) — esto es una capa de agregación sobre el detalle por músculo, puede calcularse en frontend a partir del detalle si no existe ya agrupado en backend
- Endpoint de stats generales por rango: `{ workouts: number, duration_min: number, volume_kg: number, series: number }` + el mismo dato del periodo anterior para calcular el delta

---

## 6. Encargo para Claude Code — orden de fases

1. Fase 1: Pantalla principal (heatmap semanal + selector de días + listado de estadísticas avanzadas, sin conectar aún los sub-detalles)
2. Fase 2: Sub-pantalla "Distribución del cuerpo" (reutiliza heatmap, añade navegador de semana + tabla)
3. Fase 3: Sub-pantalla "Distribución de los músculos" (radar chart — la única pieza nueva de verdad, todo lo demás reutiliza componentes ya construidos)
4. Fase 4 (opcional): placeholders de los 4 ítems restantes del listado

Aprobación explícita entre fases, como siempre.
