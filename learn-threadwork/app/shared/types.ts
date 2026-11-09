// The Threadwork domain model. This file is given: read it in Phase 1, don't change it.

export const IMPORTANCE = ["low", "medium", "high", "critical"] as const;
export type Importance = (typeof IMPORTANCE)[number];

export const STATUSES = ["inbox", "doing", "done"] as const;
export type Status = (typeof STATUSES)[number];

/** A calendar day as "YYYY-MM-DD". Strings compare correctly with < and >. */
export type Day = string;

export interface ResourceUse {
  resourceId: string;
  used: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  importance: Importance;
  due: Day | null;
  details: string;
  links: string[];          // ids of related tasks (links go both ways)
  resources: ResourceUse[];
  createdAt: Day;
  doneAt: Day | null;
}

export type PlantKind = "tomato" | "chili" | "lemon" | "eggplant";

export interface Harvest {
  kind: PlantKind;
  fruits: number;
  day: Day;
}

export interface GardenState {
  kind: PlantKind;          // what is growing now
  growth: number;           // 0..100
  extra: number;            // growth beyond 100, carried into the next plant
  nextKind: PlantKind;      // what to plant after the next harvest
  harvests: Harvest[];
}

export interface StreakState {
  streak: number;
  lastDone: Day | null;
}

/** Either a value or an error message. Used instead of throwing for expected failures. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// ---------- Notes, resources, sketches, inspiration (Parts 5–7) ----------

export type NoteKind = "note" | "draft" | "table";

export interface Note {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;            // text for notes and drafts
  rows: string[][];        // cells for tables; rows[0] is the header row
  taskId: string | null;   // the task this note belongs to, if any
  updatedAt: number;       // milliseconds since 1970 (Date.now())
}

export type ResourceKind = "link" | "file" | "tool" | "book" | "person";

export interface Resource {
  id: string;
  name: string;
  kind: ResourceKind;
  url: string;             // "" when there is no link
}

/** A finished pencil stroke, ready to draw as an SVG <path>. */
export interface SavedStroke {
  d: string;               // SVG path data
  color: string;
  width: number;
  opacity: number;
}

export interface Sketch {
  id: string;
  title: string;
  taskId: string | null;
  strokes: SavedStroke[];
  width: number;
  height: number;
  createdAt: Day;
}

export type Pin =
  | { id: string; type: "quote"; text: string; author: string }
  | { id: string; type: "goal"; text: string };

export interface Treat { id: string; name: string; cost: number }
export interface Claimed { treatId: string; name: string; cost: number; day: Day }

// ---------- The whole app ----------

export interface AppState {
  tasks: Task[];
  garden: GardenState;
  streak: StreakState;
  focusSessions: number;
  notes: Note[];
  resources: Resource[];
  sketches: Sketch[];
  pins: Pin[];
  treats: Treat[];
  claimed: Claimed[];
}
