// Given: small helpers the pages share.
import type { Day } from "@app/shared/types";

export type Route = "tasks" | "decisions" | "settings";
export const ROUTES: Route[] = ["tasks", "decisions", "settings"];
export const ROUTE_NAMES: Record<Route, string> = { tasks: "Tasks", decisions: "Decisions", settings: "Settings" };

export const newId = () => crypto.randomUUID();

/** Today in the device's own time zone, as "YYYY-MM-DD". */
export const todayKey = (d = new Date()): Day =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Offers a text file to download. */
export function download(name: string, text: string, type = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
