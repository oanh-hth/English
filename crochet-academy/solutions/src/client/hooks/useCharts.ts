import { useCallback, useEffect, useRef, useState } from 'react';
import type { Chart, ChartInput } from '@/shared/types';
import { ApiError, type ApiClient } from '../api/client';

export interface UseChartsResult {
  status: 'loading' | 'ready' | 'error';
  charts: Chart[];
  error: string | null;
  create: (input: ChartInput) => Promise<Chart>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

function describe(error: unknown): string {
  if (error instanceof ApiError) return error.messages.join(', ');
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function useCharts(api: ApiClient): UseChartsResult {
  const [state, setState] = useState<Pick<UseChartsResult, 'status' | 'charts' | 'error'>>({ status: 'loading', charts: [], error: null });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const charts = await api.list();
      if (mounted.current) setState({ status: 'ready', charts, error: null });
    } catch (error) {
      if (mounted.current) setState((s) => ({ ...s, status: 'error', error: describe(error) }));
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: ChartInput) => {
      const chart = await api.create(input);
      if (mounted.current) setState((s) => ({ ...s, charts: [chart, ...s.charts] }));
      return chart;
    },
    [api],
  );

  const remove = useCallback(
    async (id: string) => {
      await api.remove(id);
      if (mounted.current) setState((s) => ({ ...s, charts: s.charts.filter((c) => c.id !== id) }));
    },
    [api],
  );

  return { ...state, create, remove, refresh };
}
