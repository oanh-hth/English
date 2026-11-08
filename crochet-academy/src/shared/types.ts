/** The data model of the whole app. These types are PROVIDED: read them carefully, you will use them everywhere. */

export type StitchId =
  | 'ch' | 'sl' | 'sc' | 'hdc' | 'dc' | 'tr' | 'dtr' | 'tch' | 'mr'
  | 'inc' | 'dec' | 'invdec' | 'sk' | 'cl' | 'shell' | 'v'
  | 'picot' | 'bob' | 'puff' | 'pop' | 'fpdc' | 'bpdc';

export type StitchCategory = 'Basic' | 'Shaping' | 'Texture';

/** Which loop of the stitch below you work into: back loop only, front loop only, or both (empty string). */
export type LoopMod = '' | 'BLO' | 'FLO';

export interface Stitch {
  id: StitchId;
  /** Short written form, e.g. "sc". */
  abbr: string;
  name: string;
  category: StitchCategory;
  /** How many stitches this leaves on the row (an increase leaves 2, a magic ring leaves 0). */
  makes: number;
  /** How many stitches of the row below it works into (a decrease works into 2, a chain into 0). */
  uses: number;
  /** Whether BLO / FLO makes sense for this stitch. */
  allowsMod: boolean;
  description: string;
  /** UK crochet uses different names for the same stitches. Only present where they differ. */
  uk?: { abbr: string; name: string };
}

/** "6 sc" or "2 dc BLO": one stitch type, worked n times. */
export interface StitchItem {
  kind: 'st';
  st: StitchId;
  n: number;
  mod: LoopMod;
}

/** "(sc, inc) x 6": a list of items repeated `rep` times. Groups may contain groups. */
export interface GroupItem {
  kind: 'grp';
  rep: number;
  items: Item[];
}

export type Item = StitchItem | GroupItem;

export interface Row {
  id: string;
  /** Yarn colour as #rrggbb. */
  color: string;
  note: string;
  items: Item[];
  /** Set when the user dismissed the "stitch count looks off" hint for this row. */
  skipCheck?: boolean;
}

export type ChartMode = 'flat' | 'round';

export interface Chart {
  id: string;
  name: string;
  mode: ChartMode;
  rows: Row[];
  /** Milliseconds since the epoch. */
  updated: number;
}

/** What the API accepts when creating or replacing a chart. */
export interface ChartInput {
  name: string;
  mode: ChartMode;
  rows: Row[];
}
