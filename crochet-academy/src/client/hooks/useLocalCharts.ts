import { useCallback, useEffect, useState } from 'react';
import type { Chart, ChartInput } from '@/shared/types';
import type { ApiClient } from '../api/client';
import type { UseChartsResult } from './useCharts';

/** PROVIDED: the small stand-in for useCharts (5.2) used while that exercise is still a stub. */
export function useLocalCharts(api: ApiClient): UseChartsResult {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [status, setStatus] = useState<UseChartsResult['status']>('loading');

  const refresh = useCallback(async () => {
    setCharts(await api.list());
    setStatus('ready');
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: ChartInput) => {
    const chart = await api.create(input);
    setCharts((all) => [chart, ...all]);
    return chart;
  }, [api]);

  const remove = useCallback(async (id: string) => {
    await api.remove(id);
    setCharts((all) => all.filter((c) => c.id !== id));
  }, [api]);

  return { status, charts, error: null, create, remove, refresh };
}
