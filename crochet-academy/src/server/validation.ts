import { todo } from '@/shared/todo';
import type { ChartInput } from '@/shared/types';
import { isStitchId } from '@/core/stitchLookup';

export type ValidationResult = { ok: true; value: ChartInput } | { ok: false; errors: string[] };

/**
 * Exercise 4.1: never trust data from the network. Check an `unknown` request body and either
 * return a clean ChartInput or a list of everything that is wrong (all problems at once, not just the first).
 *
 *  body            must be a plain object (not null, not an array)          "body must be a JSON object"
 *  name            string, 1 to 60 characters after trimming                "name must be 1 to 60 characters"
 *  mode            "flat" or "round"                                        'mode must be "flat" or "round"'
 *  rows            array of at most 200 rows                                "rows must be an array of at most 200 rows"
 *  rows[i].id      non-empty string                                         "rows[0].id must be a non-empty string"
 *  rows[i].color   #rrggbb                                                  "rows[0].color must be a #rrggbb colour"
 *  rows[i].note    optional; text of at most 200 characters (default "")    "rows[0].note must be text of at most 200 characters"
 *  rows[i].skipCheck optional true/false                                    "rows[0].skipCheck must be true or false"
 *  rows[i].items   array                                                    "rows[0].items must be an array"
 *  item (kind "st")   st is a known stitch id ........................... "rows[0].items[1].st is not a known stitch"
 *                     n whole number 1..99 ............................... "rows[0].items[1].n must be a whole number from 1 to 99"
 *                     mod "", "BLO" or "FLO" ............................. 'rows[0].items[1].mod must be "", "BLO" or "FLO"'
 *  item (kind "grp")  rep whole number 1..99 ............................ "...rep must be a whole number from 1 to 99"
 *                     items array of items, nested at most 4 groups deep .. "...items must be an array" / "...is nested too deeply"
 *  any other kind     'rows[0].items[1].kind must be "st" or "grp"'
 *
 * The returned value is REBUILT from the known fields only (unknown properties are dropped), with the name trimmed.
 * The error messages above are exact: the tests look for the path part, like "rows[0].items[1].n".
 */
export function parseChartInput(body: unknown): ValidationResult {
  // TODO(4.1)
  return todo('4.1');
}
