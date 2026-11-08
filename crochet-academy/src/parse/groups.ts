import { todo } from '@/shared/todo';
import type { Item } from '@/shared/types';
import { parseToken, type ParseContext } from './tokens';

/**
 * Exercise 2.2a: split text on commas and semicolons, but NOT inside brackets.
 *
 *   "sc, inc, 2 dc"                 -> ["sc", "inc", "2 dc"]
 *   "(sc, inc) x 6, ch 2"           -> ["(sc, inc) x 6", "ch 2"]
 *   "sc; ((dc, ch 1) x 2), sc"      -> ["sc", "((dc, ch 1) x 2)", "sc"]
 * Pieces are trimmed and empty pieces are dropped. Both ( ) and [ ] count as brackets.
 */
export function splitTop(text: string): string[] {
  // TODO(2.2)
  return todo('2.2');
}

/**
 * Exercise 2.2b: parse a whole sequence of stitches and groups into items.
 *
 *   "MR, 6 sc"                       -> [mr, 6 sc]
 *   "(sc, inc) x 6"                  -> [ group rep 6 of [sc, inc] ]
 *   "[2 dc, ch 1] 12 times"          -> [ group rep 12 of [2 dc, ch 1] ]
 *   "(sc, inc) repeat 5 more times"  -> [ group rep 6 ]        ("5 more" means 6 in total)
 *   "(sc, (ch 1) x 2) x 3"           -> groups can nest
 *   "(counts as dc) sc"              -> no repeat marker: the stitches are just added inline
 *   "(sc, inc) x 6 sl st"            -> text after a repeat marker is parsed as more items
 * Repeat markers: "x 6", "× 6", "*6"?? no: only  x N  |  × N  |  N times  |  N time  |  repeat N times  |  repeat N more times.
 * Repeats are limited to 1..99. A group with no readable items is dropped.
 * Plain pieces go through parseToken (2.1), sharing the same ctx.
 */
export function parseSequence(text: string, ctx: ParseContext): Item[] {
  // TODO(2.2)
  return todo('2.2');
}
