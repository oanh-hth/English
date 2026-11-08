import type { StitchCategory, StitchId } from '@/shared/types';
import { stitchesByCategory, displayName } from '@/core/stitchLookup';
import { Glyph } from '../chart/Glyph';

export interface StitchPickerProps {
  selected: StitchId;
  onSelect: (id: StitchId) => void;
  uk?: boolean;
}

export function StitchPicker({ selected, onSelect, uk = false }: StitchPickerProps) {
  const groups = stitchesByCategory();
  return (
    <div className="st-picker">
      {(Object.keys(groups) as StitchCategory[]).map((category) => (
        <fieldset key={category}>
          <legend>{category}</legend>
          {groups[category].map((stitch) => {
            const { abbr, name } = displayName(stitch.id, uk);
            return (
              <button
                key={stitch.id}
                type="button"
                className="st-btn"
                aria-label={name}
                aria-pressed={stitch.id === selected}
                onClick={() => onSelect(stitch.id)}
              >
                <Glyph id={stitch.id} />
                <span>{abbr}</span>
              </button>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}
