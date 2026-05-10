/**
 * components/charts/CompletionBar.jsx
 *
 * Horizontal completion rate bar per questionnaire with group breakdown.
 * Props:
 *   groups — [{ label, rate, color, n }]
 *   width
 */
import React from 'react';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { FONTS, COLOURS } from '../../theme/typography';

const ROW_H = 22;
const PAD_L = 0;
const PAD_R = 36;
const BAR_H = 12;

export default function CompletionBar({ groups, width }) {
  if (!groups?.length) return null;
  const barW = width - PAD_L - PAD_R;
  const h    = groups.length * ROW_H + 4;

  return (
    <Svg width={width} height={h}>
      {groups.map((g, i) => {
        const y      = i * ROW_H + (ROW_H - BAR_H) / 2;
        const fillW  = Math.max(barW * g.rate, g.rate > 0 ? 2 : 0);
        return (
          <React.Fragment key={g.label}>
            {/* Track */}
            <Rect x={PAD_L} y={y} width={barW} height={BAR_H}
              fill="rgba(74,123,181,0.08)" rx={BAR_H / 2} />
            {/* Fill */}
            {fillW > 0 && (
              <Rect x={PAD_L} y={y} width={fillW} height={BAR_H}
                fill={g.color} rx={BAR_H / 2} />
            )}
            {/* Percent label */}
            <SvgText x={width - PAD_R + 4} y={y + BAR_H - 2} fontSize={10}
              fontFamily={FONTS.bodyMedium} fill={COLOURS.primaryDark}>
              {Math.round(g.rate * 100)}%
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
