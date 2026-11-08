import { todo } from '@/shared/todo';
import type { Chart } from '@/shared/types';
import { displayName } from '@/core/stitchLookup';
import { inkOn } from '@/shared/color';
import { GlyphMark } from './Glyph';
import { layoutFlat } from './layout';

export interface SymbolChartProps {
  chart: Chart;
  activeRowId?: string | null;
  uk?: boolean;
  onSelectRow?: (rowId: string) => void;
}

/**
 * Exercise 3.5: draw the chart as an SVG using the layout from 3.4.
 *
 * With no rows, render  <p className="muted">Add a row to see your chart.</p>  and nothing else.
 *
 * Otherwise:
 * <svg role="img" aria-label={`Chart: ${chart.name}`} viewBox="0 0 W H" width={W} height={H}>
 *   <rect width={W} height={H} rx={14} fill="#fffaf3" />
 *   for every cell of layoutFlat(chart.rows):
 *     <g data-testid="cell" data-row-id={rowId} data-stitch={st} data-active={cell's row is the active row}
 *        onClick -> onSelectRow?.(rowId)>
 *       <title>{stitch name from displayName(st, uk).name, plus " (BLO)" or " (FLO)" when mod is set}</title>
 *       <rect x y width height rx={9} fill={the row's colour} />          (inset it by 2 so cells do not touch)
 *       <g transform="translate(cx cy) scale(1.35)" color={inkOn(row colour)}> <GlyphMark id={st} mod={mod} /> </g>
 *     </g>
 *   for every label: <text x y textAnchor={side === 'left' ? 'end' : 'start'} ...>{label.text}</text>
 * </svg>
 * `cx, cy` is the centre of the cell. Round charts are drawn like flat ones for now (see the stretch exercise in 3.4).
 */
export function SymbolChart(props: SymbolChartProps) {
  // TODO(3.5)
  return todo('3.5');
}
