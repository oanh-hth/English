import type { LoopMod, StitchId } from '@/shared/types';

/**
 * PROVIDED: the little crochet-chart drawing for each stitch, as SVG markup in a 24x24 space centred on 0,0.
 * (Standard chart symbols: a chain is an oval, a double crochet is a T with one slash, ...)
 */
const slash = (y: number) => `M-4.5 ${y + 1.6}L4.5 ${y - 1.6}`;
const GLYPHS: Record<StitchId, string> = {
  ch: '<ellipse rx="7" ry="3.8"/>',
  tch: '<ellipse rx="7" ry="3.8" stroke-dasharray="2.5 2.5"/>',
  sl: '<circle r="3.4" fill="currentColor" stroke="none"/>',
  sc: '<path d="M-6 0H6M0 -6V6"/>',
  hdc: '<path d="M-6 -8H6M0 -8V8"/>',
  dc: `<path d="M-6 -8H6M0 -8V8${slash(1)}"/>`,
  tr: `<path d="M-6 -8H6M0 -8V8${slash(-1)}${slash(3.5)}"/>`,
  dtr: `<path d="M-6 -8H6M0 -8V8${slash(-3)}${slash(1)}${slash(5)}"/>`,
  mr: '<circle r="7.5"/><circle r="3"/>',
  inc: '<path d="M0 8L-5 -8M0 8L5 -8M-8 -8H-2M2 -8H8"/>',
  dec: '<path d="M-5 8L0 -8M5 8L0 -8M-8 8H-2M2 8H8"/>',
  invdec: '<path d="M-5 8L0 -8M5 8L0 -8M-8 8H-2M2 8H8"/><circle cx="0" cy="-9" r="2" fill="currentColor" stroke="none"/>',
  sk: '<path d="M-6 0H6" stroke-dasharray="2 3" opacity=".7"/>',
  cl: '<path d="M-6 8L0 -8M0 8V-8M6 8L0 -8"/>',
  shell: '<path d="M0 8L-8 -7M0 8L-4 -8M0 8V-8M0 8L4 -8M0 8L8 -7"/>',
  v: '<path d="M0 8L-5 -8M0 8L5 -8"/><path d="M-4.3 -1.5L-0.6 0.5M4.3 -1.5L0.6 0.5"/>',
  picot: '<circle cx="0" cy="-3" r="4.5"/><path d="M0 1.5V8"/>',
  bob: '<ellipse cx="0" cy="-3" rx="4.5" ry="7" fill="currentColor"/><path d="M0 4V9"/>',
  puff: '<ellipse cx="0" cy="-3" rx="4.5" ry="7"/><path d="M0 4V9"/>',
  pop: '<ellipse cx="0" cy="-3" rx="5" ry="7.5"/><path d="M-2.5 -3H2.5M0 -5.5V-0.5"/><path d="M0 4.5V9"/>',
  fpdc: `<path d="M-6 -8H6M0 -8V8${slash(1)}M0 8Q0 11 4 10"/>`,
  bpdc: `<path d="M-6 -8H6M0 -8V8${slash(1)}M0 8Q0 11 -4 10"/>`,
};

const MODS: Record<LoopMod, string> = {
  '': '',
  BLO: '<path d="M-7.5 11H7.5" stroke-width="1.5" opacity=".75"/>',
  FLO: '<path d="M-7.5 -11.5H7.5" stroke-width="1.5" opacity=".75"/>',
};

/** A <g> to place inside an <svg>. Takes its colour from the CSS/SVG `color` of a parent. */
export function GlyphMark({ id, mod = '' }: { id: StitchId; mod?: LoopMod }) {
  return (
    <g
      fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: GLYPHS[id] + MODS[mod] }}
    />
  );
}

/** A small standalone icon. */
export function Glyph({ id, mod = '', size = 26 }: { id: StitchId; mod?: LoopMod; size?: number }) {
  return (
    <svg viewBox="-13 -13 26 26" width={size} height={size} aria-hidden="true" focusable="false">
      <GlyphMark id={id} mod={mod} />
    </svg>
  );
}
