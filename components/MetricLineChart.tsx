import React, { useState } from 'react';
import { View, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import { C, FONT } from '../pages/migrated/theme';

export interface MetricSeries {
  key: string;
  color: string;
  /** null = sin dato esa sesion (no se dibuja ese punto, la linea salta al siguiente disponible). */
  values: (number | null)[];
}

interface MetricLineChartProps {
  series: MetricSeries[];
  pointCount: number;
  width?: number;
  height?: number;
  /** Unidad a mostrar junto al valor en el tooltip al tocar un punto (ej. "kg"). */
  unit?: string;
  /** Etiqueta por punto (ej. fecha corta) mostrada como segunda línea del tooltip. */
  pointLabels?: string[];
}

// Cada serie se escala de forma INDEPENDIENTE a su propio min/max (no hay un
// eje Y compartido) — con 2-3 metricas de escalas muy distintas (kg vs
// repeticiones vs RIR 0-10) es la unica forma de que las 3 formas/tendencias
// se vean con claridad a la vez en el mismo alto de grafica.
function scalePoints(values: (number | null)[], chartHeight: number, paddingRatio = 0.12): (number | null)[] {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return values.map(() => null);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const pad = chartHeight * paddingRatio;
  const usable = chartHeight - pad * 2;
  return values.map((v) => (v === null ? null : pad + usable - ((v - min) / range) * usable));
}

export default function MetricLineChart({ series, pointCount, width = 320, height = 180, unit, pointLabels }: MetricLineChartProps) {
  const [selected, setSelected] = useState<number | null>(null);

  if (pointCount < 2) {
    return null;
  }
  const stepX = pointCount > 1 ? width / (pointCount - 1) : 0;

  // Solo se necesita la serie principal (la primera) para el tooltip — es lo
  // único que muestran las pantallas que usan este gráfico hoy (una métrica
  // a la vez), pero se deja preparado para más de una serie sin romper nada.
  const primary = series[0];
  const primaryScaled = primary ? scalePoints(primary.values, height) : [];

  const handleTouch = (evt: GestureResponderEvent) => {
    const x = evt.nativeEvent.locationX;
    let idx = Math.round(x / (stepX || 1));
    idx = Math.max(0, Math.min(pointCount - 1, idx));
    setSelected(idx);
  };

  const selectedValue = selected !== null && primary ? primary.values[selected] : null;
  const selectedY = selected !== null ? primaryScaled[selected] : null;
  const selectedX = selected !== null ? selected * stepX : null;

  return (
    <View>
      <View
        style={{ width, height }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <Svg width={width} height={height}>
          {/* linea base */}
          <Line x1={0} y1={height - 1} x2={width} y2={height - 1} stroke="#E5E5EA" strokeWidth={1} />
          {selectedX !== null && (
            <Line x1={selectedX} y1={0} x2={selectedX} y2={height} stroke={C.border} strokeWidth={1} strokeDasharray="3,3" />
          )}
          {series.map((s) => {
            const scaled = scalePoints(s.values, height);
            let path = '';
            scaled.forEach((y, i) => {
              if (y === null) return;
              const x = i * stepX;
              path += path === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
            });
            return (
              <React.Fragment key={s.key}>
                <Path d={path} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {scaled.map((y, i) =>
                  y === null ? null : (
                    <Circle
                      key={i}
                      cx={i * stepX}
                      cy={y}
                      r={selected === i ? 5 : 3}
                      fill={s.color}
                      stroke={selected === i ? '#FFFFFF' : 'none'}
                      strokeWidth={selected === i ? 2 : 0}
                    />
                  )
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {selected !== null && selectedValue !== null && selectedY !== null && selectedX !== null && (
        <View
          pointerEvents="none"
          style={[
            tooltipStyles.bubble,
            {
              left: Math.max(0, Math.min(width - 84, selectedX - 42)),
              top: Math.max(0, selectedY - 46),
            },
          ]}
        >
          <Text style={tooltipStyles.value}>
            {selectedValue}
            {unit ? ` ${unit}` : ''}
          </Text>
          {pointLabels?.[selected] ? <Text style={tooltipStyles.label}>{pointLabels[selected]}</Text> : null}
        </View>
      )}
    </View>
  );
}

const tooltipStyles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    minWidth: 84,
    backgroundColor: C.accentBlack,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  value: { fontFamily: FONT.bold, fontSize: 13, color: '#FFFFFF' },
  label: { fontFamily: FONT.regular, fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
});
