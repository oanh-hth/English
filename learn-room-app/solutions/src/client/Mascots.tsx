import type { ReactElement } from 'react';
import { mascotMessages } from '../domain/mascots';
import type { Item } from '../domain/types';

interface Props {
  items: readonly Item[];
  today: Date;
}

/**
 * Shows what Miso and Misu say.
 *  - <section aria-label="Pets"> with one <article> per message from mascotMessages(items, today)
 *  - each article has aria-label = the pet's name ("Miso" / "Misu"), data-mood = its mood,
 *    and contains the name in <strong> and the line in a <p>
 */
export function Mascots({ items, today }: Props): ReactElement {
  // @solution-start Derive the messages while rendering. key = the pet's name.
  return (
    <section aria-label="Pets">
      {mascotMessages(items, today).map((m) => (
        <article key={m.who} aria-label={m.who} data-mood={m.mood}>
          <strong>{m.who}</strong>
          <p>{m.line}</p>
        </article>
      ))}
    </section>
  );
  // @solution-end
}
