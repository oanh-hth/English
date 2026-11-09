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
  // TODO: Derive the messages while rendering. key = the pet's name.
  throw new Error('Not implemented yet');
}
