// Exercise 1.2: Look up and group categories. Read curriculum/part-1/b-unions-and-records.md first.

export const GROUPS = ["Frontend", "Backend", "Workflow"] as const;
export type Group = (typeof GROUPS)[number];

export interface Category { id: string; name: string; group: Group }

/** Every topic of web development, frontend first. Add your own if something is missing. */
export const CATEGORIES = [
  // Frontend
  { id: "html", name: "HTML & semantics", group: "Frontend" },
  { id: "css", name: "CSS", group: "Frontend" },
  { id: "layout", name: "Layout (Flexbox, Grid)", group: "Frontend" },
  { id: "responsive", name: "Responsive design", group: "Frontend" },
  { id: "design-systems", name: "Design systems & UI components", group: "Frontend" },
  { id: "javascript", name: "JavaScript", group: "Frontend" },
  { id: "typescript", name: "TypeScript", group: "Frontend" },
  { id: "react", name: "React", group: "Frontend" },
  { id: "state", name: "State management", group: "Frontend" },
  { id: "routing", name: "Routing & navigation", group: "Frontend" },
  { id: "forms", name: "Forms & validation", group: "Frontend" },
  { id: "data-fetching", name: "Data fetching & caching", group: "Frontend" },
  { id: "accessibility", name: "Accessibility", group: "Frontend" },
  { id: "performance", name: "Performance", group: "Frontend" },
  { id: "animation", name: "Animation & graphics (SVG, Canvas)", group: "Frontend" },
  { id: "browser-apis", name: "Browser APIs", group: "Frontend" },
  { id: "pwa", name: "PWA & offline", group: "Frontend" },
  { id: "i18n", name: "Internationalisation", group: "Frontend" },
  { id: "frontend-testing", name: "Frontend testing", group: "Frontend" },
  { id: "build-tools", name: "Build tools & bundlers", group: "Frontend" },
  { id: "frontend-security", name: "Frontend security", group: "Frontend" },
  // Backend
  { id: "node", name: "Node.js", group: "Backend" },
  { id: "apis", name: "APIs (REST, GraphQL)", group: "Backend" },
  { id: "auth", name: "Authentication & authorization", group: "Backend" },
  { id: "databases", name: "Databases & storage", group: "Backend" },
  { id: "backend-testing", name: "Backend testing", group: "Backend" },
  { id: "server-security", name: "Server security", group: "Backend" },
  // Workflow
  { id: "architecture", name: "Architecture & patterns", group: "Workflow" },
  { id: "code-quality", name: "Code quality & refactoring", group: "Workflow" },
  { id: "git", name: "Git & collaboration", group: "Workflow" },
  { id: "deployment", name: "Deployment & hosting", group: "Workflow" },
  { id: "tooling", name: "Tooling & editor", group: "Workflow" },
  { id: "debugging", name: "Debugging", group: "Workflow" },
  { id: "learning", name: "Learning & career", group: "Workflow" },
] as const satisfies readonly Category[];

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/** Type guard: true when `value` is the id of one of the CATEGORIES. */
export function isCategoryId(value: unknown): value is CategoryId {
  // TODO 1.2
  throw new Error("TODO 1.2");
}

/** The category with this id, or undefined. */
export function categoryById(id: string): Category | undefined {
  // TODO 1.2
  throw new Error("TODO 1.2");
}

/** Categories grouped for a menu: every group in GROUPS order (even if empty), categories in list order. */
export function categoriesByGroup(): Record<Group, Category[]> {
  // TODO 1.2
  throw new Error("TODO 1.2");
}
