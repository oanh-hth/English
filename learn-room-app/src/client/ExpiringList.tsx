import type { ReactElement } from 'react';
import { daysLeft } from '../domain/dates';
import { needsAttention, whenText } from '../domain/expiry';
import type { Item } from '../domain/types';

interface Props {
  items: readonly Item[];
  today: Date;
  onUse?: (id: string) => void;
}

/**
 * The "Needs attention" panel.
 *  - a <section aria-label="Needs attention"> containing a <ul>
 *  - one <li> per item from needsAttention(items, today): the item name, then whenText(daysLeft) (e.g. "Expires tomorrow")
 *  - expired items get data-status="expired", the others data-status="soon"
 *  - when onUse is given, each row has a button named "Used <name>" that calls onUse(item.id)
 *  - when nothing needs attention show the paragraph "Nothing is about to expire" instead of the list
 */
export function ExpiringList({ items, today, onUse }: Props): ReactElement {
  // TODO: Derive the list during render (no state, no effect needed). Remember the `key` prop on
  //       list items.
  throw new Error('Not implemented yet');
}
