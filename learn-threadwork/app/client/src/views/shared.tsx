// Given: small pieces the views share.
import { createContext, useContext } from "react";
import type { Api } from "@app/client/src/api/client";
import type { WeatherReply } from "@app/client/src/api/client";

export type Route = "today" | "tasks" | "map" | "sketch" | "notes" | "resources" | "inspire" | "garden" | "settings";
export const ROUTES: Route[] = ["today", "tasks", "map", "sketch", "notes", "resources", "inspire", "garden", "settings"];
export const ROUTE_NAMES: Record<Route, string> = { today: "Today", tasks: "Tasks", map: "Link map", sketch: "Sketch", notes: "Notes",
  resources: "Resources", inspire: "Inspiration", garden: "Garden", settings: "Settings" };

/** What the views need from the shell: navigation with something selected, the API and the weather. */
export interface ShellValue {
  go: (route: Route, select?: { taskId?: string; noteId?: string; sketchId?: string }) => void;
  selected: { taskId?: string; noteId?: string; sketchId?: string };
  api: Api | null;
  weather: WeatherReply | null;
}
export const ShellContext = createContext<ShellValue | null>(null);
export const useShell = () => useContext(ShellContext)!;

export const newId = () => crypto.randomUUID();
