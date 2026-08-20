import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';

export interface RadarSeries {
  /** Valores normalizados 0..1, mismo orden y longitud que axisLabels. */
  values: number[];
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth?: number;
  dashed?: boolean;
}

interface RadarChartProps {
  axisLabels: string[];
  series: RadarSeries[];
  size?: number;
  rings?: number;
  gridColor?: string;
  labelColor?: string;
}

// Angulo de cada eje en un poligono regular, empezando arriba (12 en punto)
// y avanzando en sentido horario — el orden de axisLabels define que grupo
// muscular cae en cada vertice, tal y como pide Pantallas_Estadisticas.md
// ("6 ejes en este orden").
function axisAngle(index: number, total: number): number {
  return -Math.PI / 2 + (index * 2 * Math.PI) / total;
}

function pointAt(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function polygonPointsStr(values: number[], cx: number, cy: number, maxRadius: number): string {
  return values
    .map((v, i) => {
      const [x, y] = pointAt(cx, cy, maxRadius * Math.max(0, Math.min(1, v)), axisAngle(i, values.length));
      return `${x},${y}`;
    })
    .join(' ');
}

export default function RadarChart({
  axisLabels,
  series,
  size = 260,
  rings = 4,
  gridColor = '#D1D1D6',
  labelColor = '#6B6B70',
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const labelPadding = 26;
  const maxRadius = size / 2 - labelPadding;
  const total = axisLabels.length;

  const ringLevels = Array.from({ length: rings }, (_, i) => (i + 1) / rings);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* anillos de la grid */}
        {ringLevels.map((level) => (
          <Polygon
            key={level}
            points={polygonPointsStr(Array(total).fill(level), cx, cy, maxRadius)}
            fill="none"
            stroke={gridColor}
            strokeWidth={1}
          />
        ))}
        {/* ejes */}
        {axisLabels.map((label, i) => {
          const [x, y] = pointAt(cx, cy, maxRadius, axisAngle(i, total));
          return <Line key={label} x1={cx} y1={cy} x2={x} y2={y} stroke={gridColor} strokeWidth={1} />;
        })}
        {/* series */}
        {series.map((s, si) => (
          <Polygon
            key={si}
            points={polygonPointsStr(s.values, cx, cy, maxRadius)}
            fill={s.fillColor}
            fillOpacity={s.fillOpacity}
            stroke={s.strokeColor}
            strokeWidth={s.strokeWidth ?? 2}
            strokeDasharray={s.dashed ? '5,4' : undefined}
          />
        ))}
        {/* labels */}
        {axisLabels.map((label, i) => {
          const [x, y] = pointAt(cx, cy, maxRadius + labelPadding - 8, axisAngle(i, total));
          return (
            <SvgText
              key={label}
              x={x}
              y={y}
              fontSize={11}
              fill={labelColor}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
