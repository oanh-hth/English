import { todo } from '@/shared/todo';
import type { StitchId } from '@/shared/types';
import { stitchesByCategory, displayName } from '@/core/stitchLookup';
import { Glyph } from '../chart/Glyph';

export interface StitchPickerProps {
  /** The stitch that is currently chosen. */
  selected: StitchId;
  onSelect: (id: StitchId) => void;
  /** Show UK names. */
  uk?: boolean;
}

/**
 * Exercise 3.1: the stitch picker.
 *
 * Render one <fieldset> per category (Basic, Shaping, Texture), each with a <legend> holding the category name.
 * Inside, one <button type="button"> per stitch, in catalogue order, with:
 *   - className "st-btn"
 *   - aria-label = the stitch NAME  (e.g. "Single crochet", or "Double crochet" for sc when uk is true)
 *   - aria-pressed = whether it is the selected stitch
 *   - the <Glyph id={...} /> icon and, below it, a <span> with the ABBREVIATION (e.g. "sc")
 *   - onClick calls onSelect(id)
 * Use stitchesByCategory() and displayName() from exercise 1.1.
 * Wrap everything in <div className="st-picker">.
 */
export function StitchPicker({ selected, onSelect, uk = false }: StitchPickerProps) {
  // TODO(3.1)
  return todo('3.1');
}
