import { useCallback, useEffect, useState } from "react";

export function useHashRoute<R extends string>(routes: readonly R[], fallback: R): [R, (route: R) => void] {
  const read = useCallback((): R => {
    const h = location.hash.slice(1);
    return (routes as readonly string[]).includes(h) ? (h as R) : fallback;
  }, [routes, fallback]);
  const [route, setRoute] = useState<R>(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    on();
    return () => window.removeEventListener("hashchange", on);
  }, [read]);
  const navigate = useCallback((r: R) => { location.hash = r; }, []);
  return [route, navigate];
}
