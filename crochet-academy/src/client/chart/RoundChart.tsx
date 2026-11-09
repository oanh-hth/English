import { todo } from '@/shared/todo';
import type { Chart } from '@/shared/types';
import { displayName } from '@/core/stitchLookup';
import { inkOn } from '@/shared/color';
import { GlyphMark } from './Glyph';
import { layoutRound } from './layoutRound';
import { wedgePath } from './wedge';

export interface RoundChartProps {
  chart: Chart;
  activeRowId?: string | null;
  uk?: boolean;
  onSelectRow?: (rowId: string) => void;
}

/**
 * Exercise 3.7: draw the chart as rings, using layoutRound from 3.6. A sibling of SymbolChart (3.5):
 * the same ideas, a different layout.
 *
 * With no rows, render  <p className="muted">Add a round to see your chart.</p>  and nothing else.
 *
 * Otherwise:
 * <svg role="img" aria-label={`Chart: ${chart.name}`} viewBox="0 0 S S" width={S} height={S}>   (S = layout.size)
 *   <rect width={S} height={S} rx={14} fill="#fffaf3" />
 *   <circle data-testid="hub" cx cy r={layout.hub - 1} fill={colour of the first row} opacity={0.55} />
 *   when layout.hasMagicRing:
 *     <g data-testid="magic-ring" transform="translate(cx cy) scale(1.1)" color="#5a4636"> <GlyphMark id="mr" /> </g>
 *   for every wedge:
 *     <g data-testid="cell" data-row-id data-stitch data-active={wedge's row is the active row} onClick -> onSelectRow?.(rowId)>
 *       <title>{stitch name from displayName(st, uk).name, plus " (BLO)" / " (FLO)" when mod is set}</title>
 *       <path d={wedgePath(cx, cy, r0, r1, start, end)} fill={row colour} />
 *       <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`} color={inkOn(row colour)}>
 *         <GlyphMark id={st} mod={mod} />
 *       </g>
 *     </g>
 *   for every label:
 *     <g data-testid="round-label"> <rect: a small rounded pill centred on x, y> <text textAnchor="middle">{label.text}</text> </g>
 * </svg>
 * (cx, cy) is layout.center. Use stroke="#fffaf3" on the wedge paths so neighbours do not blur together.
 */
export function RoundChart(props: RoundChartProps) {
  // TODO(3.7)
  return todo('3.7');
}
