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

export function RoundChart({ chart, activeRowId = null, uk = false, onSelectRow }: RoundChartProps) {
  if (!chart.rows.length) return <p className="muted">Add a round to see your chart.</p>;
  const layout = layoutRound(chart.rows);
  const { x: cx, y: cy } = layout.center;
  return (
    <svg role="img" aria-label={`Chart: ${chart.name}`} viewBox={`0 0 ${layout.size} ${layout.size}`} width={layout.size} height={layout.size}>
      <rect width={layout.size} height={layout.size} rx={14} fill="#fffaf3" />
      <circle data-testid="hub" cx={cx} cy={cy} r={layout.hub - 1} fill={chart.rows[0].color} opacity={0.55} stroke="#fffaf3" strokeWidth={2} />
      {layout.hasMagicRing ? (
        <g data-testid="magic-ring" transform={`translate(${cx} ${cy}) scale(1.1)`} color="#5a4636">
          <GlyphMark id="mr" />
        </g>
      ) : null}
      {layout.wedges.map((wedge) => {
        const row = chart.rows[wedge.rowIndex];
        const active = row.id === activeRowId;
        const name = displayName(wedge.st, uk).name + (wedge.mod ? ` (${wedge.mod})` : '');
        return (
          <g key={`${wedge.rowId}-${wedge.index}`} data-testid="cell" data-row-id={wedge.rowId} data-stitch={wedge.st} data-active={active} onClick={() => onSelectRow?.(wedge.rowId)}>
            <title>{name}</title>
            <path d={wedgePath(cx, cy, wedge.r0, wedge.r1, wedge.start, wedge.end)} fill={row.color} stroke={active ? '#c9746a' : '#fffaf3'} strokeWidth={active ? 2.5 : 1.5} strokeLinejoin="round" />
            <g transform={`translate(${wedge.x} ${wedge.y}) rotate(${wedge.rotation}) scale(${wedge.scale})`} color={inkOn(row.color)}>
              <GlyphMark id={wedge.st} mod={wedge.mod} />
            </g>
          </g>
        );
      })}
      {layout.labels.map((label) => (
        <g key={label.rowIndex} data-testid="round-label">
          <rect x={label.x - 10} y={label.y - 8} width={20} height={16} rx={8} fill="#fffaf3" stroke="#5a4636" strokeWidth={1} />
          <text x={label.x} y={label.y + 4} fontSize={10.5} fontWeight={800} textAnchor="middle" fill="#5a4636">{label.text}</text>
        </g>
      ))}
    </svg>
  );
}
