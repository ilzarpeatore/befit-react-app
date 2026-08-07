import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Path, Circle } from 'react-native-svg';

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

export default function MetricLineChart({ series, pointCount, width = 320, height = 180 }: MetricLineChartProps) {
  if (pointCount < 2) {
    return null;
  }
  const stepX = pointCount > 1 ? width / (pointCount - 1) : 0;

  return (
    <View>
      <Svg width={width} height={height}>
        {/* linea base */}
        <Line x1={0} y1={height - 1} x2={width} y2={height - 1} stroke="#E5E5EA" strokeWidth={1} />
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
                y === null ? null : <Circle key={i} cx={i * stepX} cy={y} r={3} fill={s.color} />
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
