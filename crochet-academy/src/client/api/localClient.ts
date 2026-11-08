import type { Chart, ChartInput } from '@/shared/types';
import { newId } from '@/shared/id';
import type { ApiClient } from './client';

/**
 * PROVIDED: an ApiClient that keeps charts in this browser (localStorage) instead of calling the server.
 * The app uses it until you have built the real client (5.1) and the data hook (5.2), so you can try the
 * importer and the editor as soon as those exercises are green.
 */
const KEY = 'academy.charts';

function read(): Chart[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(data) ? (data as Chart[]) : [];
  } catch {
    return [];
  }
}
function write(charts: Chart[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(charts));
  } catch {
    /* storage can be blocked: the app still works for this session */
  }
}

export function createLocalClient(): ApiClient {
  return {
    async list() {
      return read().sort((a, b) => b.updated - a.updated);
    },
    async create(input: ChartInput) {
      const chart: Chart = { ...structuredClone(input), id: newId(), updated: Date.now() };
      write([chart, ...read()]);
      return chart;
    },
    async update(id: string, input: ChartInput) {
      const charts = read();
      const index = charts.findIndex((c) => c.id === id);
      if (index < 0) throw new Error('Chart not found');
      charts[index] = { ...structuredClone(input), id, updated: Date.now() };
      write(charts);
      return charts[index];
    },
    async remove(id: string) {
      write(read().filter((c) => c.id !== id));
    },
  };
}
