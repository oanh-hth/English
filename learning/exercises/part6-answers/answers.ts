// PART 6 EXERCISE: the small pure helpers behind the exercise engine.
// Run: npm test. Make every test in answers.test.ts pass. Hints: learning/part6/a-helpers.md

/** Normalize curly apostrophes, strip . , ! ? ; : " and split on whitespace. */
export function tokens(s: string): string[] {
  throw new Error('TODO');
}

/** Lower-case tokens joined by single spaces, so "Can I get a latte, please?" equals "can i get a latte please". */
export function norm(s: string): string {
  throw new Error('TODO');
}

/** True if the attempt equals any accepted answer after normalizing. */
export function isCorrect(attempt: string, accepted: string[]): boolean {
  throw new Error('TODO');
}

/** Cloze: replace the word (or its inflection) in the sentence with "_____". Return null if it can't be found. */
export function blankWord(sentence: string, word: string): string | null {
  throw new Error('TODO');
}

/** Fisher-Yates shuffle that does NOT mutate the input. `rand` lets tests make it deterministic. */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  throw new Error('TODO');
}

/** n unique wrong answers from the pool, never equal to the correct one. */
export function pickDistractors(correct: string, pool: readonly string[], n: number, rand: () => number = Math.random): string[] {
  throw new Error('TODO');
}
