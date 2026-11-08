import type { ReactElement } from 'react';
import { formatVND } from '../domain/spending';
import type { SpendingComparison } from '../domain/spending';

interface Props {
  spending: SpendingComparison;
}

/**
 * Month-to-date spending card.
 *  - <section aria-label="Spending"> showing the current amount with formatVND
 *  - a line "Last month, same days: <formatVND(previousSameDays)>"
 *  - the change line (role="status"):
 *      changePct null            -> "No data for last month yet"
 *      trend 'up'                -> "Up 25% vs last month"      (rounded to a whole number, no sign)
 *      trend 'down'              -> "Down 25% vs last month"
 *      trend 'flat'              -> "Same as last month"
 *  - the section gets data-trend="up" | "down" | "flat"
 */
export function SpendingCard({ spending }: Props): ReactElement {
  // @solution-start Compute the change text in a small function above the return. Math.abs + Math.round for the percentage.
  const { current, previousSameDays, changePct, trend } = spending;
  let change: string;
  if (changePct === null) change = 'No data for last month yet';
  else if (trend === 'flat') change = 'Same as last month';
  else change = `${trend === 'up' ? 'Up' : 'Down'} ${Math.round(Math.abs(changePct))}% vs last month`;
  return (
    <section aria-label="Spending" data-trend={trend}>
      <strong>{formatVND(current)}</strong>
      <p>Last month, same days: {formatVND(previousSameDays)}</p>
      <p role="status">{change}</p>
    </section>
  );
  // @solution-end
}
