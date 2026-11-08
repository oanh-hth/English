/**
 * PROVIDED. In development, Vite pushes new code to the page when you save a file. An error boundary that is
 * already showing its "Waiting for exercise X" card would keep showing it, so boundaries call this to clear
 * their error after every update and try rendering again.
 */
export function onHotUpdate(callback: () => void): () => void {
  const hot = import.meta.hot;
  if (!hot) return () => {};
  // React Fast Refresh swaps in the new component code a moment after Vite announces the update: wait for it,
  // otherwise the old (still throwing) code would be rendered again.
  const later = () => setTimeout(callback, 120);
  hot.on('vite:afterUpdate', later);
  return () => hot.off('vite:afterUpdate', later);
}
