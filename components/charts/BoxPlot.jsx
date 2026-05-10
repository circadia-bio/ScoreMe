/**
 * components/charts/BoxPlot.jsx
 *
 * SVG box-and-whisker plot. Supports multiple groups side by side.
 * Props:
 *   groups  — [{ label, stats, color }]  where stats = describe() output
 *   maxVal  — axis max (questionnaire maxScore)
 *   width   — SVG width
 *   height  — SVG height (default 160)
 */
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { FONTS, COLOURS } from '../../theme/typography';

const PAD = { top: 12, bottom: 32, left: 28, right: 8 };

export default function BoxPlot({ groups, maxVal, width, height = 160 }) {
  if (!groups?.length) return null;

  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const toY = val => PAD.top + plotH - (val / maxVal) * plotH;

  // Axis ticks — 5 evenly spaced
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));

  // Box width & spacing
  const slotW = plotW / groups.length;
  const boxW  = Math.min(slotW * 0.45, 32);

  return (
    <Svg width={width} height={height}>
      {/* Y-axis ticks */}
      {ticks.map(t => {
        const y = toY(t);
        return (
          <React.Fragment key={t}>
            <Line x1={PAD.left - 4} y1={y} x2={width - PAD.right} y2={y}
              stroke="rgba(74,123,181,0.10)" strokeWidth={1} />
            <SvgText x={PAD.left - 6} y={y + 4} fontSize={9} fontFamily={FONTS.bodyMedium}
              fill={COLOURS.textMuted} textAnchor="end">{t}</SvgText>
          </React.Fragment>
        );
      })}

      {/* Y-axis line */}
      <Line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH}
        stroke="rgba(74,123,181,0.18)" strokeWidth={1} />

      {groups.map((g, i) => {
        const s = g.stats;
        if (!s) return null;
        const cx = PAD.left + slotW * i + slotW / 2;
        const x  = cx - boxW / 2;

        const yQ1  = toY(s.q1);
        const yQ3  = toY(s.q3);
        const yMed = toY(s.median);
        const yWlo = toY(s.whiskerLo);
        const yWhi = toY(s.whiskerHi);
        const yMean= toY(s.mean);

        return (
          <React.Fragment key={g.label}>
            {/* Whiskers */}
            <Line x1={cx} y1={yWhi} x2={cx} y2={yQ3} stroke={g.color} strokeWidth={1.5} strokeDasharray="3,2" />
            <Line x1={cx} y1={yQ1}  x2={cx} y2={yWlo} stroke={g.color} strokeWidth={1.5} strokeDasharray="3,2" />
            {/* Whisker caps */}
            <Line x1={cx - boxW * 0.3} y1={yWhi} x2={cx + boxW * 0.3} y2={yWhi} stroke={g.color} strokeWidth={1.5} />
            <Line x1={cx - boxW * 0.3} y1={yWlo} x2={cx + boxW * 0.3} y2={yWlo} stroke={g.color} strokeWidth={1.5} />
            {/* IQR box */}
            <Rect x={x} y={yQ3} width={boxW} height={Math.max(yQ1 - yQ3, 1)}
              fill={g.color + '22'} stroke={g.color} strokeWidth={1.5} rx={3} />
            {/* Median line */}
            <Line x1={x} y1={yMed} x2={x + boxW} y2={yMed} stroke={g.color} strokeWidth={2} />
            {/* Mean diamond */}
            <SvgText x={cx} y={yMean + 4} fontSize={8} textAnchor="middle" fill={g.color} fontFamily={FONTS.bodyMedium}>◆</SvgText>
            {/* Outliers */}
            {s.outliers.map((o, j) => (
              <Circle key={j} cx={cx} cy={toY(o)} r={2.5} fill="none" stroke={g.color} strokeWidth={1} />
            ))}
            {/* Group label */}
            <SvgText x={cx} y={height - 6} fontSize={9} textAnchor="middle"
              fill={COLOURS.primaryDark} fontFamily={FONTS.bodyMedium}>
              {g.label.length > 8 ? g.label.slice(0, 7) + '…' : g.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
