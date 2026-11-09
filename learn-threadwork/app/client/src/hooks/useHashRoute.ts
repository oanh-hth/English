// Exercise 4.5: useHashRoute: moving between pages. Read curriculum/part-4/c-navigation-and-selectors.md first.

/**
 * Returns [route, navigate].
 * - route: location.hash without "#", if it is one of `routes`; otherwise `fallback`.
 * - navigate(r): sets location.hash = r.
 * - Updates when the hash changes (listen to "hashchange" on window; remove the listener on unmount).
 */
export function useHashRoute<R extends string>(routes: readonly R[], fallback: R): [R, (route: R) => void] {
  // TODO 4.5
  return [fallback, () => {}];
}
