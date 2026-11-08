/** Pure helpers for dragging an item around the room. The Room component feeds them pointer events. */

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Keep a value between lo and hi. */
export function clamp(value: number, lo: number, hi: number): number {
  // TODO: Math.min / Math.max.
  throw new Error('Not implemented yet');
}

/**
 * Convert a pointer position (clientX, clientY, in screen pixels) into room percentages 0-100,
 * relative to the room's box. Round to 1 decimal. Positions outside the box are clamped.
 * A box with zero width or height gives { x: 50, y: 50 } (avoid dividing by zero).
 */
export function pointToPercent(clientX: number, clientY: number, box: Box): { x: number; y: number } {
  // TODO: Subtract the box origin, divide by its size, multiply by 100, clamp, then round with
  //       Math.round(v * 10) / 10.
  throw new Error('Not implemented yet');
}
