/** A short random id. Good enough for a learning project. */
export function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}
