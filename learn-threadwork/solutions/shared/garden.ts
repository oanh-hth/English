import type { Day, GardenState, PlantKind } from "@app/shared/types";

export const VARIETIES: Record<PlantKind, { name: string; plural: string; fruits: number; unlockAfter: number }> = {
  tomato: { name: "Tomato", plural: "tomatoes", fruits: 5, unlockAfter: 0 },
  chili: { name: "Chili", plural: "chilies", fruits: 6, unlockAfter: 1 },
  lemon: { name: "Lemon tree", plural: "lemons", fruits: 4, unlockAfter: 3 },
  eggplant: { name: "Eggplant", plural: "eggplants", fruits: 4, unlockAfter: 5 },
};

export type GardenAction =
  | { type: "grow"; amount: number }
  | { type: "shrink"; amount: number }
  | { type: "harvest"; day: Day }
  | { type: "chooseSeed"; kind: PlantKind };

export const initialGarden: GardenState = { kind: "tomato", growth: 0, extra: 0, nextKind: "tomato", harvests: [] };

export function isUnlocked(garden: GardenState, kind: PlantKind): boolean {
  return garden.harvests.length >= VARIETIES[kind].unlockAfter;
}

export function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case "grow": {
      const total = state.growth + action.amount;
      return { ...state, growth: Math.min(100, total), extra: state.extra + Math.max(0, total - 100) };
    }
    case "shrink":
      return { ...state, growth: Math.max(0, state.growth - action.amount) };
    case "harvest": {
      if (state.growth < 100) return state;
      const harvests = [...state.harvests, { kind: state.kind, fruits: VARIETIES[state.kind].fruits, day: action.day }];
      const after = { ...state, harvests };
      const kind = isUnlocked(after, state.nextKind) ? state.nextKind : "tomato";
      return { ...after, kind, growth: Math.min(state.extra, 99), extra: 0 };
    }
    case "chooseSeed": {
      if (!isUnlocked(state, action.kind)) return state;
      return { ...state, nextKind: action.kind, kind: state.growth < 5 ? action.kind : state.kind };
    }
  }
}
