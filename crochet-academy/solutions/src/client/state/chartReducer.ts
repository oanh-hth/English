import type { Chart, ChartMode, Row } from '@/shared/types';
import { addGroup, addRow, addStitch, moveRow, removeItem, removeRow, type StitchToAdd } from '@/core/chartOps';

export type ChartAction =
  | { type: 'rename'; name: string }
  | { type: 'setMode'; mode: ChartMode }
  | { type: 'addRow'; color?: string }
  | { type: 'removeRow'; rowId: string }
  | { type: 'moveRow'; rowId: string; direction: 'up' | 'down' }
  | { type: 'addStitch'; rowId: string; stitch: StitchToAdd; groupIndex?: number }
  | { type: 'addGroup'; rowId: string; rep?: number }
  | { type: 'removeItem'; rowId: string; index: number; groupIndex?: number }
  | { type: 'setNote'; rowId: string; note: string }
  | { type: 'setColor'; rowId: string; color: string }
  | { type: 'dismissHint'; rowId: string };

function changeRow(state: Chart, rowId: string, change: Partial<Row>): Chart {
  if (!state.rows.some((r) => r.id === rowId)) return state;
  return { ...state, rows: state.rows.map((r) => (r.id === rowId ? { ...r, ...change } : r)) };
}

export function chartReducer(state: Chart, action: ChartAction): Chart {
  switch (action.type) {
    case 'rename': return { ...state, name: action.name };
    case 'setMode': return { ...state, mode: action.mode };
    case 'addRow': return addRow(state, action.color);
    case 'removeRow': return removeRow(state, action.rowId);
    case 'moveRow': return moveRow(state, action.rowId, action.direction);
    case 'addStitch': return addStitch(state, action.rowId, action.stitch, action.groupIndex);
    case 'addGroup': return addGroup(state, action.rowId, action.rep);
    case 'removeItem': return removeItem(state, action.rowId, action.index, action.groupIndex);
    case 'setNote': return changeRow(state, action.rowId, { note: action.note });
    case 'setColor': return changeRow(state, action.rowId, { color: action.color });
    case 'dismissHint': return changeRow(state, action.rowId, { skipCheck: true });
    default: {
      const unreachable: never = action;
      return unreachable;
    }
  }
}
