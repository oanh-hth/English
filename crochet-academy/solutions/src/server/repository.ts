import type { Chart, ChartInput } from '@/shared/types';
import { newId } from '@/shared/id';

export interface RepositoryOptions {
  now?: () => number;
  initial?: Chart[];
  onChange?: (charts: Chart[]) => void;
}

export class ChartRepository {
  private readonly charts = new Map<string, Chart>();
  private readonly now: () => number;
  private readonly onChange?: (charts: Chart[]) => void;

  constructor(options: RepositoryOptions = {}) {
    this.now = options.now ?? Date.now;
    this.onChange = options.onChange;
    for (const chart of options.initial ?? []) this.charts.set(chart.id, structuredClone(chart));
  }

  list(): Chart[] {
    return structuredClone([...this.charts.values()].sort((a, b) => b.updated - a.updated));
  }

  get(id: string): Chart | undefined {
    const chart = this.charts.get(id);
    return chart ? structuredClone(chart) : undefined;
  }

  create(input: ChartInput): Chart {
    const chart: Chart = { ...structuredClone(input), id: newId(), updated: this.now() };
    this.charts.set(chart.id, chart);
    this.changed();
    return structuredClone(chart);
  }

  update(id: string, input: ChartInput): Chart | undefined {
    if (!this.charts.has(id)) return undefined;
    const chart: Chart = { ...structuredClone(input), id, updated: this.now() };
    this.charts.set(id, chart);
    this.changed();
    return structuredClone(chart);
  }

  remove(id: string): boolean {
    const removed = this.charts.delete(id);
    if (removed) this.changed();
    return removed;
  }

  private changed(): void {
    this.onChange?.(this.list());
  }
}
