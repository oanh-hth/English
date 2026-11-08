import type { Guess } from '@/domain/billTypes';

/** Parsers take the category guesser as a parameter, so these tests do not depend on your guessCategory. */
export const fakeGuess: Guess = (name) => (/sữa|cà phê|phê/i.test(name) ? 'dairy' : 'other');
