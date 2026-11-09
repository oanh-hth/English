// Exercise 2.2: The garden reducer: grow, harvest, unlock. Read curriculum/part-2/b-reducers.md first.
import type { Day, GardenState, PlantKind } from "@app/shared/types";

export const VARIETIES: Record<PlantKind, { name: string; plural: string; fruits: number; unlockAfter: number }> = {
  tomato: { name: "Tomato", plural: "tomatoes", fruits: 5, unlockAfter: 0 },
  chili: { name: "Chili", plural: "chilies", fruits: 6, unlockAfter: 1 },
  lemon: { name: "Lemon tree", plural: "lemons", fruits: 4, unlockAfter: 3 },
  eggplant: { name: "Eggplant", plural: "eggplants", fruits: 4, unlockAfter: 5 },
};

export type GardenAction =
  | { type: "grow"; amount: number }
  | { type: "shrink"; amount: number }          // a finished task was un-done
  | { type: "harvest"; day: Day }
  | { type: "chooseSeed"; kind: PlantKind };

export const initialGarden: GardenState = { kind: "tomato", growth: 0, extra: 0, nextKind: "tomato", harvests: [] };

/** True when enough harvests were made to plant this kind. */
export function isUnlocked(garden: GardenState, kind: PlantKind): boolean {
  // TODO 2.2
  throw new Error("TODO 2.2");
}

/**
 * Rules:
 * - grow: add amount; growth stops at 100 and anything above goes into `extra`.
 * - shrink: subtract amount; never below 0.
 * - harvest: only when growth is 100 (otherwise return the same state object).
 *   Adds { kind, fruits (from VARIETIES), day } to harvests, then plants `nextKind`
 *   (or "tomato" if nextKind is still locked) with growth = min(extra, 99) and extra = 0.
 * - chooseSeed: sets nextKind if unlocked (otherwise same state). If the current plant is still
 *   a seed (growth < 5) it is replaced right away too.
 * Never mutate `state`.
 */
export function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  // TODO 2.2
  throw new Error("TODO 2.2");
}
