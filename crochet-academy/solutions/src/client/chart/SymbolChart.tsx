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

export function SymbolChart({ chart, activeRowId = null, uk = false, onSelectRow }: SymbolChartProps) {
  if (!chart.rows.length) return <p className="muted">Add a row to see your chart.</p>;
  const layout = layoutFlat(chart.rows);
  return (
    <svg role="img" aria-label={`Chart: ${chart.name}`} viewBox={`0 0 ${layout.width} ${layout.height}`} width={layout.width} height={layout.height}>
      <rect width={layout.width} height={layout.height} rx={14} fill="#fffaf3" />
      {layout.cells.map((cell) => {
        const row = chart.rows[cell.rowIndex];
        const active = row.id === activeRowId;
        const name = displayName(cell.st, uk).name + (cell.mod ? ` (${cell.mod})` : '');
        return (
          <g key={`${cell.rowId}-${cell.index}`} data-testid="cell" data-row-id={cell.rowId} data-stitch={cell.st} data-active={active} onClick={() => onSelectRow?.(cell.rowId)}>
            <title>{name}</title>
            <rect x={cell.x + 2} y={cell.y + 3} width={cell.w - 4} height={cell.h - 6} rx={9} fill={row.color} stroke={active ? '#c9746a' : '#fffaf3'} strokeWidth={active ? 2.5 : 1.5} />
            <g transform={`translate(${cell.x + cell.w / 2} ${cell.y + cell.h / 2}) scale(1.35)`} color={inkOn(row.color)}>
              <GlyphMark id={cell.st} mod={cell.mod} />
            </g>
          </g>
        );
      })}
      {layout.labels.map((label) => (
        <text key={label.rowIndex} x={label.x} y={label.y + 4} fontSize={12} fontWeight={800} fill="#5a4636" textAnchor={label.side === 'left' ? 'end' : 'start'}>
          {label.text}
        </text>
      ))}
    </svg>
  );
}
