import { dormantList, idleDays } from './dormant';
import { needsAttention } from './expiry';
import { daysLeft } from './dates';
import { compareSpending } from './spending';
import type { Item } from './types';

export type Mood = 'happy' | 'worried' | 'scolding' | 'sleepy' | 'curious';

export interface MascotMessage {
  who: 'Miso' | 'Misu';
  mood: Mood;
  line: string;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * What the two pets say about the room today.
 *
 * Miso (the cat, who worries about money and dates) says exactly ONE thing; the first rule that applies wins:
 *   1. no item in the room (not used)         -> mood 'sleepy',   "The room is empty. Add something!"
 *   2. at least one expired item              -> mood 'worried',  "<n> item(s) expired. Please check the room."
 *   3. otherwise items expiring soon (<= 3 d) -> mood 'worried',  "<n> item(s) will expire in the next 3 days."
 *   4. spending trend 'up' with changePct >= 30 -> mood 'scolding', "You spent <rounded pct>% more than last month. Easy on the shopping!"
 *   5. otherwise                              -> mood 'happy',    "Everything looks fine. Nice and calm."
 * "n item(s)": 1 item, 2 items.
 *
 * Misu (the dog) speaks only when something is dormant (see dormantList): about the item idle the LONGEST,
 *   mood 'curious', `Have you used "<name>" yet? It has been <idle days> days.`
 *
 * Result: [miso] or [miso, misu]. Miso first.
 */
export function mascotMessages(items: readonly Item[], today: Date): MascotMessage[] {
  // TODO: Compose what you built in parts 1 and 2: needsAttention, daysLeft, compareSpending,
  //       dormantList, idleDays. Build Miso's message with early returns, then add Misu's.
  throw new Error('Not implemented yet');
}
