import { todo } from '@/shared/todo';
import type { StitchId, StitchItem } from '@/shared/types';
import { STITCH_WORDS, UK_WORD_MAP } from '@/shared/stitchWords';
import { getStitch } from '@/core/stitchLookup';

/** Shared by the whole parser. `unknown` collects the pieces of text the parser could not understand. */
export interface ParseContext {
  uk: boolean;
  unknown: string[];
}

export interface NameMatch {
  id: StitchId;
  /** The words that matched, lower case with single spaces: "sl st", "double crochet". */
  word: string;
  /** What is left after the name, trimmed. */
  rest: string;
}

/**
 * Exercise 2.1a: find a stitch name at the START of the text.
 *
 * STITCH_WORDS (provided) lists regular-expression sources per stitch, in the order to try them.
 * Match case-insensitively, anchored to the start, and make sure the name ends at a letter boundary:
 * "scarf" must not match "sc"; "dc2" may match "dc" (a number can follow a name).
 *
 *   "sc in next st"   -> { id: 'sc', word: 'sc', rest: 'in next st' }
 *   "Double  Crochet" -> { id: 'dc', word: 'double crochet', rest: '' }
 *   "wibble"          -> null
 */
export function matchStitchName(text: string): NameMatch | null {
  // TODO(2.1)
  return todo('2.1');
}

/**
 * Exercise 2.1b: turn ONE comma-separated piece of a pattern into a stitch item.
 *
 * Accepted shapes (case does not matter, extra spaces are fine):
 *   "sc"  "6 sc"  "6sc"  "6 x sc"  "sc 6"  "ch 5"  "ch-5"
 *   "2 dc in next st"            the words after the name ("in ...", "around", "across", ...) are ignored
 *   "6 sc BLO" / "sc in back loop only" / "dc FLO"      sets mod (only for stitches that allow it)
 *   "then 3 dc", "and sc"        a leading then / and / work / make is ignored
 *   "turn", "fasten off", ""     return null and record nothing
 * A missing count means 1. Counts are limited to 1..99.
 *
 * With ctx.uk true, UK words are translated first: "3 tr" means 3 dc (use UK_WORD_MAP and the word that matched).
 *
 * If the stitch name is not recognised, push the original text onto ctx.unknown and return null.
 * If the name is fine but something odd is left over (e.g. "6 sc wobble"), still return the item
 * and push the original text onto ctx.unknown.
 */
export function parseToken(raw: string, ctx: ParseContext): StitchItem | null {
  // TODO(2.1)
  return todo('2.1');
}
