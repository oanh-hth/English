// Exercise 5.1: DecisionFilters. Read curriculum/part-5/a-filters.md first.
import type { Group } from "@app/shared/categories";
import { Todo } from "@app/client/src/components/Todo";

export interface FilterValue { group: Group | null; category: string | null; text: string }

export interface DecisionFiltersProps {
  value: FilterValue;
  counts: Record<string, number>;          // decisions per category id (countByCategory from 2.3)
  onChange: (value: FilterValue) => void;
}

/**
 * <div role="search" aria-label="Filter decisions"> with:
 * - group buttons "All", "Frontend", "Backend", "Workflow" (GROUPS from 1.2) with aria-pressed for the current one.
 *   Choosing a group also clears the category.
 * - a select labelled "Category": "All categories" (value ""), then the categories of the chosen group
 *   (or of every group when "All"), each as "<name> (<count>)". Categories with 0 decisions are left out,
 *   except the one currently selected. Choosing "" sets category null.
 * - a search input labelled "Search decisions" (type="search")
 * - when any filter is set, a button "Clear filters" that resets all three
 * Every change calls onChange with the complete new value.
 */
export function DecisionFilters(props: DecisionFiltersProps) {
  // TODO 5.1
  return <Todo exercise="5.1" what="Decision filters" />;
}
