import { CATEGORIES, GROUPS, type Group } from "@app/shared/categories";

export interface FilterValue { group: Group | null; category: string | null; text: string }

export interface DecisionFiltersProps {
  value: FilterValue;
  counts: Record<string, number>;
  onChange: (value: FilterValue) => void;
}

export function DecisionFilters({ value, counts, onChange }: DecisionFiltersProps) {
  const options = CATEGORIES.filter(c => (!value.group || c.group === value.group) && ((counts[c.id] ?? 0) > 0 || c.id === value.category));
  const active = value.group !== null || value.category !== null || value.text !== "";
  return (
    <div role="search" aria-label="Filter decisions" className="filters">
      <div className="groups">
        <button type="button" aria-pressed={value.group === null} onClick={() => onChange({ ...value, group: null, category: null })}>All</button>
        {GROUPS.map(g => (
          <button key={g} type="button" aria-pressed={value.group === g} onClick={() => onChange({ ...value, group: g, category: null })}>{g}</button>
        ))}
      </div>
      <label htmlFor="f-category">Category</label>
      <select id="f-category" value={value.category ?? ""} onChange={e => onChange({ ...value, category: e.target.value || null })}>
        <option value="">All categories</option>
        {options.map(c => <option key={c.id} value={c.id}>{c.name} ({counts[c.id] ?? 0})</option>)}
      </select>
      <label htmlFor="f-text">Search decisions</label>
      <input id="f-text" type="search" value={value.text} onChange={e => onChange({ ...value, text: e.target.value })} />
      {active && <button type="button" onClick={() => onChange({ group: null, category: null, text: "" })}>Clear filters</button>}
    </div>
  );
}
