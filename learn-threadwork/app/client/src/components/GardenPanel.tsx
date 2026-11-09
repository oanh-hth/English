// Exercise 7.2: GardenPanel: harvest and seeds. Read curriculum/part-7/b-garden-and-treats.md first.
import type { GardenState, PlantKind } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface GardenPanelProps {
  garden: GardenState;
  onHarvest: () => void;
  onChooseSeed: (kind: PlantKind) => void;
}

/**
 * <section aria-label="Garden">:
 * - <h2>"<plant name> · <stage>"</h2> (VARIETIES from 2.2, stageOf from 1.2)
 * - a <progress> labelled "Growth" with value = growth (rounded) and max 100
 * - when ripe (growth 100): a button "Harvest <fruits> <plural>" (e.g. "Harvest 5 tomatoes") calling onHarvest;
 *   otherwise the text "<missing>% to <next stage in lower case>" (nextStage from 1.2, missing rounded)
 * - "Next seed": one button per variety, aria-pressed when it is garden.nextKind, disabled when locked (isUnlocked),
 *   with the text "<name>" and, when locked, "Unlocks after <n> harvests" ("harvest" for 1). Clicking calls onChooseSeed.
 * - the text "<n> harvests so far" ("1 harvest so far")
 */
export function GardenPanel(props: GardenPanelProps) {
  // TODO 7.2
  return <Todo exercise="7.2" what="Garden controls" />;
}
