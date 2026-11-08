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
  // TODO: Compute the change text in a small function above the return. Math.abs + Math.round for
  //       the percentage.
  throw new Error('Not implemented yet');
}
