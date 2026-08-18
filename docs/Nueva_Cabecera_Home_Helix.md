# Nueva cabecera Home (estilo Helix) — Especificación completa

## Contexto

Sustituye la cabecera actual ("Hola, Demo!" + campana + tarjeta "Mi
Progreso") por una nueva cabecera con fondo tipo cielo/degradado,
anillos de Recovery/Strain, banner condicional, frase contextual, y las
tarjetas Sleep/Load Balance — **inmediatamente debajo, sin cambios,
sigue la sección "Mi plan de hoy" que ya funciona hoy**. No tocar nada
de lo que hay a partir de esa sección.

---

## 1. Barra superior

| Posición | Elemento | Comportamiento |
|---|---|---|
| Izquierda | Icono de calendario | **Funcional** — navega a la pantalla de Calendario ya existente y conectada (la misma a la que hoy se llega, si aplica, desde "Ver Calendario") |
| Centro | Texto de saludo (sustituye a "HELIX") | Dinámico según hora local del dispositivo: `"Buenos días, {nombre}"` (antes de mediodía), `"Buenas tardes, {nombre}"` (mediodía-atardecer), `"Buenas noches, {nombre}"` (noche) — usar el nombre real del usuario autenticado, mismos rangos horarios que decida el propio dispositivo (no hace falta `suncalc` aquí, es solo reloj, no posición solar) |
| Derecha | Icono de ajustes | Se mantiene, mismo destino que ya tuviera antes |
| Derecha (junto a ajustes) | Icono de campana | Se mantiene (la campana de notificaciones que ya existía en la cabecera anterior), ahora reubicada aquí |

---

## 2. Banner condicional — dos estados, mismo tamaño

### Estado A — sin salud conectada (por defecto)
Banner **"This is demo data"** tal cual el diseño de referencia: icono,
título, texto explicativo, botón "Continue" en píldora — mismo tamaño y
disposición que en la captura.

### Estado B — con Apple Health / Health Connect ya conectado
Sustituir por el **banner slider que ya existe en el backend pero no
está conectado a la app todavía** — **antes de construir nada, localizar
y confirmar con Claude Code cuál es ese endpoint/componente exacto** (
buscar en el backend algo tipo `banners`, `promo_sliders`, o similar ya
usado en el panel Admin) — no inventar uno nuevo si ya existe.

**El slider debe ocupar exactamente el mismo espacio/proporciones** que
el banner de demo, para que el cambio entre estado A y B no mueva el
resto del layout.

### Condición de cambio
Se determina por si el usuario ha concedido permisos de
HealthKit/Health Connect (ver `react-native-health-link`, ya
identificado en sesiones anteriores) — **esto depende de que esa
integración exista**; mientras no esté construida, el Estado A es el
único disponible. Dejar el Estado B ya preparado en el código (con el
banner real conectado), aunque no se pueda activar todavía por falta
de la integración de salud.

---

## 3. Anillos Recovery / Strain

Se mantienen en el layout **aunque no haya datos reales todavía**
(dependen también de la integración de salud, fase futura). Mostrar en
estado vacío: `"-%"` en vez de un número, con el mismo estilo de anillo
gris ya usado en otras pantallas para estados sin datos (coherente con
`Encargo2_Theme_Bevel.md`, sección de tokens).

---

## 4. Frase contextual — sistema de frases dinámicas (pieza nueva a construir)

Sustituye la frase fija tipo "A middling day — your HRV is suppressed"
por una **frase seleccionada de un catálogo, según el contexto real del
usuario** (no aleatoria sin criterio, ni una única frase fija).

### Backend — tabla nueva
```
motivational_phrases
  id
  text              string   // ej. "Llevas {n} entrenamientos esta semana, tu objetivo cada vez está más cerca"
  condition_type    enum('workouts_this_week', 'habits_streak', 'general', ...)
  min_value         integer nullable   // ej. mostrar esta frase si workouts_this_week >= 2
  max_value         integer nullable
  is_active         boolean default true
```

Permite variabilidad real (varias frases válidas para el mismo
contexto, elegidas al azar entre las que cumplan la condición) y
frases distintas según el estado real de cumplimiento (entrenamientos
completados esa semana, racha de hábitos, etc.) — soporta placeholders
tipo `{n}` que se sustituyen con el dato real al mostrarla.

### Endpoint
```
GET /api/v1/motivational-phrase
```
Lógica: calcula las métricas de contexto del usuario (entrenamientos
completados esta semana, racha de hábitos actual, etc. — reutilizando
consultas ya existentes de otras secciones, no duplicar lógica), busca
las frases cuyo `condition_type`/rango encajen, elige una al azar entre
las que apliquen, sustituye los placeholders, la devuelve.

### Ejemplos de frases a dar de alta (semilla inicial, seedear varias por condición para que haya variabilidad real)
- `workouts_this_week >= 2`: "Llevas {n} entrenamientos esta semana, tu objetivo cada vez está más cerca"
- `workouts_this_week = 0`: "Esta semana aún no has entrenado — hoy es un buen día para empezar"
- `habits_streak >= 5`: "Llevas {n} días seguidos cumpliendo tus hábitos, sigue así"
- `general` (fallback si ninguna condición específica aplica): 2-3
  frases neutras genéricas

---

## 5. Tarjetas Sleep y Load Balance

**Sin cambios respecto al diseño de referencia** — se mantienen tal
cual (mismo layout, mismos datos cuando estén disponibles vía la
integración de salud futura, mismo estado vacío mientras no lo estén).

---

## 6. Orden de construcción

1. Barra superior (sección 1) — la más simple, sin dependencias nuevas
2. Frase contextual (sección 4) — backend + endpoint primero, verificar
   con datos de prueba antes de conectar el frontend
3. Banner condicional (sección 2) — **primero localizar el banner
   slider ya existente en el backend** antes de tocar nada aquí
4. Anillos Recovery/Strain y tarjetas Sleep/Load Balance (secciones 3
   y 5) — quedan en estado vacío/placeholder, sin lógica nueva por
   ahora, a la espera de la integración de salud (fase separada, no
   forma parte de este encargo)

**No tocar absolutamente nada de la sección "Mi plan de hoy" hacia
abajo** — sigue exactamente igual que está ahora, ya funcional.
