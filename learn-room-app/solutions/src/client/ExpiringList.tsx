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
  // @solution-start Derive the list during render (no state, no effect needed). Remember the `key` prop on list items.
  const list = needsAttention(items, today);
  return (
    <section aria-label="Needs attention">
      {list.length === 0 ? (
        <p>Nothing is about to expire</p>
      ) : (
        <ul>
          {list.map((item) => {
            const days = daysLeft(item, today) as number;
            return (
              <li key={item.id} data-status={days < 0 ? 'expired' : 'soon'}>
                <span>{item.name}</span> <span>{whenText(days)}</span>
                {onUse && (
                  <button type="button" onClick={() => onUse(item.id)}>
                    Used {item.name}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
  // @solution-end
}
