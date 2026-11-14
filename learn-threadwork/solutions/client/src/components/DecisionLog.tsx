import { useMemo, useState } from "react";
import type { Task } from "@app/shared/types";
import { countByCategory, decisionsOf, filterDecisions } from "@app/shared/decisions";
import { useDebouncedValue } from "@app/client/src/hooks/useDebouncedValue";
import { DecisionFilters, type FilterValue } from "@app/client/src/components/DecisionFilters";
import { DecisionCard } from "@app/client/src/components/DecisionCard";

export interface DecisionLogProps {
  tasks: Task[];
  onEdit: (taskId: string) => void;
}

const NONE: FilterValue = { group: null, category: null, text: "" };

export function DecisionLog({ tasks, onEdit }: DecisionLogProps) {
  const [filter, setFilter] = useState<FilterValue>(NONE);
  const text = useDebouncedValue(filter.text, 250);
  const all = useMemo(() => decisionsOf(tasks), [tasks]);
  const counts = useMemo(() => countByCategory(all), [all]);
  const shown = filterDecisions(all, { group: filter.group, category: filter.category, text });

  if (all.length === 0) return <p className="empty">No decisions yet. When you finish a complex task, its result and decision appear here.</p>;
  return (
    <div className="decision-log">
      <DecisionFilters value={filter} counts={counts} onChange={setFilter} />
      <p className="muted">{shown.length} {shown.length === 1 ? "decision" : "decisions"}</p>
      {shown.length === 0 ? (
        <p className="empty">No decisions match these filters. <button type="button" onClick={() => setFilter(NONE)}>Clear filters</button></p>
      ) : (
        shown.map(d => <DecisionCard key={d.taskId} decision={d} onEdit={onEdit} onCategory={category => setFilter({ ...NONE, category })} />)
      )}
    </div>
  );
}
