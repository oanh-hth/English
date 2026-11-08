/**
 * The syllabus: phases, exercises and checklist items. This is the single source of truth for
 * `npm run learn`, the generated CHECKLIST.md, the solution check and the in-app "build exercise X" cards.
 */

export interface Exercise {
  id: string;
  title: string;
  /** Folder name inside the phase folder. */
  dir: string;
  /** The files the learner edits (relative to the repository root). */
  files: string[];
  /** Exercise ids whose code this one calls. */
  needs: string[];
  /** What the learner practises. */
  concepts: string[];
}

export interface ManualItem {
  id: string;
  label: string;
}

export interface Phase {
  id: number;
  /** Folder name inside exercises/. */
  dir: string;
  title: string;
  goal: string;
  lesson: string;
  /** Things only the learner can tick: reading, reflecting, running the app. */
  knowledge: ManualItem[];
  exercises: Exercise[];
  /** The "it works for real" check at the end of the phase. */
  milestone: ManualItem;
}

const lesson = (n: number, slug: string) => `docs/phases/phase-${n}-${slug}.md`;
const read = (n: number, slug: string): ManualItem => ({ id: `p${n}.read`, label: `Read ${lesson(n, slug)}` });
const quiz = (n: number): ManualItem => ({ id: `p${n}.quiz`, label: `Answer the checkpoint questions in notes/phase-${n}.md, in your own words` });

export const PHASES: Phase[] = [
  {
    id: 0, dir: 'phase-0-setup', title: 'Setup and the learning loop',
    goal: 'Get the project running and learn the read → red → green → checklist loop.',
    lesson: lesson(0, 'setup'),
    knowledge: [
      read(0, 'setup'),
      { id: 'p0.install', label: 'Run npm install and npm run learn without errors' },
      { id: 'p0.branch', label: 'Create your own git branch for your solutions (git switch -c my-solutions)' },
    ],
    exercises: [
      { id: '0.1', title: 'Your first green test', dir: '0.1-first-green', files: ['src/core/welcome.ts'], needs: [], concepts: ['running tests', 'reading a failing test', 'strings'] },
    ],
    milestone: { id: 'p0.milestone', label: 'You can explain what the red → green loop is and which command runs one exercise' },
  },
  {
    id: 1, dir: 'phase-1-typescript', title: 'TypeScript and the data model',
    goal: 'Model a crochet pattern with types, then write small pure functions over it.',
    lesson: lesson(1, 'typescript'),
    knowledge: [read(1, 'typescript'), quiz(1)],
    exercises: [
      { id: '1.1', title: 'Stitch lookup', dir: '1.1-stitch-lookup', files: ['src/core/stitchLookup.ts'], needs: [], concepts: ['union types', 'type guards', 'Record', 'Map'] },
      { id: '1.2', title: 'Expand items into stitches', dir: '1.2-expand', files: ['src/core/expand.ts'], needs: [], concepts: ['discriminated unions', 'recursion', 'narrowing'] },
      { id: '1.3', title: 'Count a row', dir: '1.3-row-stats', files: ['src/core/rowStats.ts'], needs: ['1.1', '1.2'], concepts: ['reduce', 'composing functions'] },
      { id: '1.4', title: 'Write the pattern text', dir: '1.4-row-text', files: ['src/core/rowText.ts'], needs: ['1.1', '1.3'], concepts: ['string formatting', 'recursion', 'default parameters'] },
      { id: '1.5', title: 'Spot a likely mistake', dir: '1.5-row-hints', files: ['src/core/rowHints.ts'], needs: ['1.3'], concepts: ['business rules', 'optional properties'] },
      { id: '1.6', title: 'Edit a chart without changing it', dir: '1.6-chart-ops', files: ['src/core/chartOps.ts'], needs: [], concepts: ['immutability', 'spread', 'map/filter'] },
    ],
    milestone: { id: 'p1.milestone', label: 'npm run typecheck is clean and you can explain why chartOps never mutates its input' },
  },
  {
    id: 2, dir: 'phase-2-parsing', title: 'Parsing written patterns',
    goal: 'Teach the app to read pasted pattern text: tokens, groups, whole patterns.',
    lesson: lesson(2, 'parsing'),
    knowledge: [read(2, 'parsing'), quiz(2)],
    exercises: [
      { id: '2.1', title: 'Read one stitch', dir: '2.1-parse-token', files: ['src/parse/tokens.ts'], needs: ['1.1'], concepts: ['regular expressions', 'normalising input'] },
      { id: '2.2', title: 'Groups and repeats', dir: '2.2-groups', files: ['src/parse/groups.ts'], needs: ['2.1'], concepts: ['scanning', 'bracket depth', 'recursion'] },
      { id: '2.3', title: 'Read a whole pattern', dir: '2.3-pattern', files: ['src/parse/pattern.ts'], needs: ['2.2'], concepts: ['pipelines', 'edge cases', 'look-ahead'] },
    ],
    milestone: { id: 'p2.milestone', label: 'In the app (npm run dev) click Import pattern, paste the example and see rows appear' },
  },
  {
    id: 3, dir: 'phase-3-react', title: 'React and TypeScript UI',
    goal: 'Build the editor: picker, row cards, reducer, layout maths and the SVG chart.',
    lesson: lesson(3, 'react'),
    knowledge: [read(3, 'react'), quiz(3)],
    exercises: [
      { id: '3.1', title: 'The stitch picker', dir: '3.1-stitch-picker', files: ['src/client/components/StitchPicker.tsx'], needs: ['1.1'], concepts: ['components', 'props', 'lists and keys', 'accessibility'] },
      { id: '3.2', title: 'The chart reducer', dir: '3.2-chart-reducer', files: ['src/client/state/chartReducer.ts'], needs: ['1.6'], concepts: ['useReducer', 'discriminated union actions', 'never'] },
      { id: '3.3', title: 'A row card', dir: '3.3-row-card', files: ['src/client/components/RowCard.tsx'], needs: ['1.3', '1.4'], concepts: ['controlled inputs', 'event bubbling', 'conditional rendering'] },
      { id: '3.4', title: 'Where does each stitch go?', dir: '3.4-flat-layout', files: ['src/client/chart/layout.ts'], needs: ['1.2'], concepts: ['pure layout maths', 'testing numbers'] },
      { id: '3.5', title: 'The symbol chart', dir: '3.5-symbol-chart', files: ['src/client/chart/SymbolChart.tsx'], needs: ['1.1', '1.2', '3.4'], concepts: ['SVG in React', 'callbacks', 'thin components'] },
    ],
    milestone: { id: 'p3.milestone', label: 'In the editor (npm run dev) pick stitches, add them to a row and watch the cards and chart update' },
  },
  {
    id: 4, dir: 'phase-4-node', title: 'The Node API',
    goal: 'Build the server: validation, a repository, REST routes and saving to disk.',
    lesson: lesson(4, 'node'),
    knowledge: [read(4, 'node'), quiz(4)],
    exercises: [
      { id: '4.1', title: 'Validate what the network sends', dir: '4.1-validation', files: ['src/server/validation.ts'], needs: ['1.1'], concepts: ['unknown', 'type guards', 'error lists'] },
      { id: '4.2', title: 'A repository for charts', dir: '4.2-repository', files: ['src/server/repository.ts'], needs: [], concepts: ['classes', 'Map', 'defensive copies', 'dependency injection'] },
      { id: '4.3', title: 'The REST API', dir: '4.3-routes', files: ['src/server/routes.ts'], needs: ['4.1', '4.2'], concepts: ['Express', 'status codes', 'middleware order', 'supertest'] },
      { id: '4.4', title: 'Save to a file', dir: '4.4-file-store', files: ['src/server/fileStore.ts'], needs: ['4.2'], concepts: ['fs/promises', 'atomic writes', 'promise chains'] },
    ],
    milestone: { id: 'p4.milestone', label: 'With npm run dev:server running, create, list and delete a chart with curl (see the lesson)' },
  },
  {
    id: 5, dir: 'phase-5-fullstack', title: 'Full stack and the capstone',
    goal: 'Connect the browser to your API, then finish with a real algorithm.',
    lesson: lesson(5, 'fullstack'),
    knowledge: [read(5, 'fullstack'), quiz(5)],
    exercises: [
      { id: '5.1', title: 'A typed API client', dir: '5.1-api-client', files: ['src/client/api/client.ts'], needs: [], concepts: ['fetch', 'generics', 'custom errors'] },
      { id: '5.2', title: 'A data hook', dir: '5.2-use-charts', files: ['src/client/hooks/useCharts.ts'], needs: ['5.1'], concepts: ['custom hooks', 'useEffect cleanup', 'useCallback'] },
      { id: '5.3', title: 'Count rounds from a photo', dir: '5.3-estimate-rounds', files: ['src/core/estimateRounds.ts'], needs: [], concepts: ['algorithms', 'signal processing', 'synthetic test data'] },
    ],
    milestone: { id: 'p5.milestone', label: 'In the browser: create, edit, save and delete a chart; restart the server and it is still there' },
  },
];

export const ALL_EXERCISES: Array<Exercise & { phase: Phase }> = PHASES.flatMap((phase) => phase.exercises.map((e) => ({ ...e, phase })));

export function findExercise(id: string) {
  return ALL_EXERCISES.find((e) => e.id === id);
}

export function exercisePath(e: { phase: Phase; dir: string }): string {
  return `exercises/${e.phase.dir}/${e.dir}`;
}

export const MANUAL_ITEMS: ManualItem[] = PHASES.flatMap((p) => [...p.knowledge, p.milestone]);
