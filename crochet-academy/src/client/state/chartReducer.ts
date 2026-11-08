import { todo } from '@/shared/todo';
import type { Chart, ChartMode } from '@/shared/types';
import type { StitchToAdd } from '@/core/chartOps';

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

/**
 * Exercise 3.2: the reducer that holds the chart being edited. A reducer is a pure function:
 * (current state, action) -> next state. React's useReducer calls it for you.
 *
 *   rename       set chart.name
 *   setMode      set chart.mode
 *   setNote      set that row's note        (unknown row: return the same state)
 *   setColor     set that row's colour
 *   dismissHint  set that row's skipCheck to true
 *   everything else: delegate to your functions from exercise 1.6
 *     addRow -> addRow(state, color) ... removeItem -> removeItem(state, rowId, index, groupIndex)
 *
 * Never change `state`. If nothing changes (unknown row id), return the SAME state object.
 * End the switch with an exhaustiveness check so that adding an action type without handling it is a compile error.
 */
export function chartReducer(state: Chart, action: ChartAction): Chart {
  // TODO(3.2)
  return todo('3.2');
}
