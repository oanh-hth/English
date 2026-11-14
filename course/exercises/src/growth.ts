// Part 8 exercises 8.1 to 8.5. Make `npm test` pass for test/growth.test.ts.
export type PlantType = 'tomato' | 'chilli' | 'strawberry' | 'sunflower' | 'pumpkin' | 'sugarcane' | 'bamboo';
export const NEED: Record<PlantType, number> = { tomato: 600, chilli: 450, strawberry: 500, sunflower: 750, pumpkin: 900, sugarcane: 1100, bamboo: 1300 };
export const STAGES = ['Seed', 'Sprout', 'Seedling', 'Growing', 'Budding', 'Ready to harvest'] as const;

/** t is growth/need clamped to 0..1. index: 5 when t >= 1, else 0 if t < .08, 1 if < .25, 2 if < .5, 3 if < .75, else 4. */
export function stageOf(growth: number, need: number): { t: number; index: number; label: string } { throw new Error('TODO 8.1'); }

export type Garden = { growth: number | null; bank: number }; // growth is null when no plant is growing

/** Add points. No plant: everything goes to the bank. Past ripe: the extra goes to the bank. becameRipe is true only when this call crossed `need`. */
export function addPoints(g: Garden, points: number, need: number): { garden: Garden; becameRipe: boolean } { throw new Error('TODO 8.2'); }

/** Planting a seed: the bank pours into the new plant, at most `need`. Whatever does not fit stays in the bank. */
export function plantSeed(bank: number, need: number): Garden { throw new Error('TODO 8.3'); }

/** Thirsty after 3 or more days without studying, or never watered. */
export const isThirsty = (lastWatered: string | null, today: string): boolean => { throw new Error('TODO 8.4'); };

/** The last 7 days, oldest first. true when that day is in wateredDays. */
export function weekStrip(wateredDays: string[], today: string): boolean[] { throw new Error('TODO 8.5'); }
