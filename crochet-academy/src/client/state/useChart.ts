import { useReducer } from 'react';
import type { Chart } from '@/shared/types';
import { chartReducer } from './chartReducer';

/** PROVIDED: a hook that holds one chart and updates it through YOUR reducer (exercise 3.2). */
export function useChart(initial: Chart) {
  return useReducer(chartReducer, initial);
}
