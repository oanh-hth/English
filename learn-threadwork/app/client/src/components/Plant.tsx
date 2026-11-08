// Exercise 5.1: drawing with SVG from data. See curriculum/phase-5-graphics-and-pencil/5.1-plant.md
import type { PlantKind } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface PlantParts {
  seed: boolean;      // true while growth < 5
  leaves: number;     // 0 while a seed; then min(12, floor(growth / 8) + 2)
  flowers: number;    // from 50%: min(maxFruits, floor((growth - 50) / 6) + 1) minus fruits (never below 0)
  fruits: number;     // from 65%: min(maxFruits, floor((growth - 65) / 7) + 1)
  ripe: boolean;      // growth >= 100
}

export const MAX_FRUITS: Record<PlantKind, number> = { tomato: 5, chili: 6, lemon: 4, eggplant: 4 };

/** Which parts to draw for a growth value (clamp growth to 0..100 first). */
export function plantParts(growth: number, kind: PlantKind): PlantParts {
  // TODO 5.1
  throw new Error("TODO 5.1");
}

/**
 * <svg role="img" viewBox="0 0 200 260" aria-label="Tomato, 58% grown, Flowering"> (use VARIETIES names, stageOf,
 * and Math.round for the percent). Draw a pot, then from plantParts():
 * an element with data-part="seed", one per leaf with data-part="leaf", per flower data-part="flower",
 * per fruit data-part="fruit" (add data-ripe="true" on fruits when ripe). Shapes and colours are up to you.
 */
export function Plant({ growth, kind }: { growth: number; kind: PlantKind }) {
  // TODO 5.1
  return <Todo exercise="5.1" what="Your plant" />;
}
