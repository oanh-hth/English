import type { Stitch, StitchCategory, StitchId } from '@/shared/types';
import { STITCHES } from '@/shared/stitches';

const BY_ID = new Map<StitchId, Stitch>(STITCHES.map((s) => [s.id, s]));

export function getStitch(id: StitchId): Stitch {
  const stitch = BY_ID.get(id);
  if (!stitch) throw new Error(`Unknown stitch: ${id}`);
  return stitch;
}

export function isStitchId(value: string): value is StitchId {
  return BY_ID.has(value as StitchId);
}

export function stitchesByCategory(): Record<StitchCategory, Stitch[]> {
  const groups: Record<StitchCategory, Stitch[]> = { Basic: [], Shaping: [], Texture: [] };
  for (const stitch of STITCHES) groups[stitch.category].push(stitch);
  return groups;
}

export function displayName(id: StitchId, uk: boolean): { abbr: string; name: string } {
  const stitch = getStitch(id);
  const names = uk && stitch.uk ? stitch.uk : stitch;
  return { abbr: names.abbr, name: names.name };
}
