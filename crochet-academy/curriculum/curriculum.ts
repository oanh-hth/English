/**
 * The syllabus: parts, sections, exercises and checklist items. This is the single source of truth for
 * `npm run learn`, the generated CHECKLIST.md, the solution check and the in-app "build exercise X" cards.
 *
 * The shape follows the Full Stack Open course: a PART is a chapter, split into lettered SECTIONS (1a, 1b, ...).
 * Every section is a written tutorial that ends with the exercises that practise it.
 */

export interface Exercise {
  id: string;
  title: string;
  /** Folder name inside the part's exercises folder. */
  dir: string;
  /** The files the learner edits (relative to the repository root). */
  files: string[];
  /** Exercise ids whose code this one calls. */
  needs: string[];
  /** What the learner practises. */
  concepts: string[];
}

export interface Section {
  /** "a", "b", ... */
  letter: string;
  title: string;
  /** Exercises that come at the end of this section. */
  exercises: string[];
}

export interface ManualItem {
  id: string;
  label: string;
}

export interface Part {
  id: number;
  title: string;
  /** One sentence: what this part is about. */
  goal: string;
  /** What the app can do once the part is finished. */
  appAfter: string;
  sections: Section[];
  exercises: Exercise[];
  /** Questions to answer in your own words in notes/partN.md. */
  notes: ManualItem;
  /** The "it works for real" check at the end of the part. */
  milestone: ManualItem;
}


const SLUGS = ['getting-started', 'typescript', 'parsing', 'react', 'node', 'fullstack'];

/** Folder name used under docs/ and exercises/, e.g. part1-typescript. */
const slug = (id: number) => `part${id}-${SLUGS[id]}`;

export const sectionDoc = (part: Part, section: Section) =>
  `docs/${slug(part.id)}/${section.letter}-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.md`;
export const partDoc = (part: Part) => `docs/${slug(part.id)}/README.md`;

export const PARTS: Array<Part & { slug: string }> = [
  {
    id: 0, slug: slug(0), title: 'Getting started',
    goal: 'Learn how the course works and get the red → green loop running.',
    appAfter: 'Nothing visible yet: you have a working project and your first green test.',
    sections: [
      { letter: 'a', title: 'How this course works', exercises: [] },
      { letter: 'b', title: 'Setup and the learning loop', exercises: ['0.1'] },
    ],
    exercises: [
      { id: '0.1', title: 'Your first green test', dir: '0.1-first-green', files: ['src/core/welcome.ts'], needs: [], concepts: ['running tests', 'reading a failing test', 'strings'] },
    ],
    notes: { id: 'p0.notes', label: 'Write in notes/part0.md: what the red → green loop is, and which command runs one exercise' },
    milestone: { id: 'p0.milestone', label: 'npm install and npm run learn both work, and you made your own git branch (git switch -c my-solutions)' },
  },
  {
    id: 1, slug: slug(1), title: 'TypeScript and the data model',
    goal: 'Describe a crochet pattern with types and write small pure functions over it.',
    appAfter: 'The editor shows the written pattern and flags rows with a likely miscount. The model is complete.',
    sections: [
      { letter: 'a', title: 'Describing a pattern with types', exercises: ['1.1', '1.2'] },
      { letter: 'b', title: 'Small functions over the model', exercises: ['1.3', '1.4', '1.5'] },
      { letter: 'c', title: 'Editing without mutating', exercises: ['1.6'] },
    ],
    exercises: [
      { id: '1.1', title: 'Stitch lookup', dir: '1.1-stitch-lookup', files: ['src/core/stitchLookup.ts'], needs: [], concepts: ['union types', 'type guards', 'Record', 'Map'] },
      { id: '1.2', title: 'Expand items into stitches', dir: '1.2-expand', files: ['src/core/expand.ts'], needs: [], concepts: ['discriminated unions', 'recursion', 'narrowing'] },
      { id: '1.3', title: 'Count a row', dir: '1.3-row-stats', files: ['src/core/rowStats.ts'], needs: ['1.1', '1.2'], concepts: ['reduce', 'composing functions'] },
      { id: '1.4', title: 'Write the pattern text', dir: '1.4-row-text', files: ['src/core/rowText.ts'], needs: ['1.1', '1.3'], concepts: ['string formatting', 'recursion', 'default parameters'] },
      { id: '1.5', title: 'Spot a likely mistake', dir: '1.5-row-hints', files: ['src/core/rowHints.ts'], needs: ['1.3'], concepts: ['business rules', 'optional properties'] },
      { id: '1.6', title: 'Edit a chart without changing it', dir: '1.6-chart-ops', files: ['src/core/chartOps.ts'], needs: [], concepts: ['immutability', 'spread', 'map/filter'] },
    ],
    notes: { id: 'p1.notes', label: 'Write the review answers for part 1 in notes/part1.md' },
    milestone: { id: 'p1.milestone', label: 'npm run typecheck is clean, and in the app (npm run dev) the editor\'s "Written pattern" panel shows your text' },
  },
  {
    id: 2, slug: slug(2), title: 'Parsing written patterns',
    goal: 'Teach the app to read pasted pattern text: tokens, groups, whole patterns.',
    appAfter: 'Import pattern works: paste a written pattern and get a chart.',
    sections: [
      { letter: 'a', title: 'Regular expressions and tokens', exercises: ['2.1'] },
      { letter: 'b', title: 'Groups, depth and recursion', exercises: ['2.2'] },
      { letter: 'c', title: 'Reading whole patterns', exercises: ['2.3'] },
    ],
    exercises: [
      { id: '2.1', title: 'Read one stitch', dir: '2.1-parse-token', files: ['src/parse/tokens.ts'], needs: ['1.1'], concepts: ['regular expressions', 'normalising input'] },
      { id: '2.2', title: 'Groups and repeats', dir: '2.2-groups', files: ['src/parse/groups.ts'], needs: ['2.1'], concepts: ['scanning', 'bracket depth', 'recursion'] },
      { id: '2.3', title: 'Read a whole pattern', dir: '2.3-pattern', files: ['src/parse/pattern.ts'], needs: ['2.2'], concepts: ['pipelines', 'edge cases', 'look-ahead'] },
    ],
    notes: { id: 'p2.notes', label: 'Write the review answers for part 2 in notes/part2.md' },
    milestone: { id: 'p2.milestone', label: 'In the app (npm run dev) click Import pattern, press Try an example and create the chart' },
  },
  {
    id: 3, slug: slug(3), title: 'React and TypeScript UI',
    goal: 'Build the editor: picker, row cards, reducer, and the chart drawings (flat and round).',
    appAfter: 'The editor works: pick stitches, build rows, watch the symbol chart (rows or rounds) update.',
    sections: [
      { letter: 'a', title: 'Components and props', exercises: ['3.1'] },
      { letter: 'b', title: 'State and reducers', exercises: ['3.2', '3.3'] },
      { letter: 'c', title: 'Drawing the chart', exercises: ['3.4', '3.5'] },
      { letter: 'd', title: 'Round charts', exercises: ['3.6', '3.7'] },
    ],
    exercises: [
      { id: '3.1', title: 'The stitch picker', dir: '3.1-stitch-picker', files: ['src/client/components/StitchPicker.tsx'], needs: ['1.1'], concepts: ['components', 'props', 'lists and keys', 'accessibility'] },
      { id: '3.2', title: 'The chart reducer', dir: '3.2-chart-reducer', files: ['src/client/state/chartReducer.ts'], needs: ['1.6'], concepts: ['useReducer', 'discriminated union actions', 'never'] },
      { id: '3.3', title: 'A row card', dir: '3.3-row-card', files: ['src/client/components/RowCard.tsx'], needs: ['1.3', '1.4'], concepts: ['controlled inputs', 'event bubbling', 'conditional rendering'] },
      { id: '3.4', title: 'Where does each stitch go?', dir: '3.4-flat-layout', files: ['src/client/chart/layout.ts'], needs: ['1.2'], concepts: ['pure layout maths', 'testing numbers'] },
      { id: '3.5', title: 'The symbol chart', dir: '3.5-symbol-chart', files: ['src/client/chart/SymbolChart.tsx'], needs: ['1.1', '1.2', '3.4'], concepts: ['SVG in React', 'callbacks', 'thin components'] },
      { id: '3.6', title: 'Rings and wedges', dir: '3.6-round-layout', files: ['src/client/chart/layoutRound.ts'], needs: ['1.2'], concepts: ['polar coordinates', 'angles', 'testing numbers'] },
      { id: '3.7', title: 'The round chart', dir: '3.7-round-chart', files: ['src/client/chart/RoundChart.tsx'], needs: ['1.1', '3.6'], concepts: ['SVG paths', 'reusing a component pattern'] },
    ],
    notes: { id: 'p3.notes', label: 'Write the review answers for part 3 in notes/part3.md' },
    milestone: { id: 'p3.milestone', label: 'In the editor (npm run dev) add stitches to a row and watch the cards and chart update, in both flat and round mode' },
  },
  {
    id: 4, slug: slug(4), title: 'The Node API',
    goal: 'Build the server: validation, a repository, REST routes and saving to disk.',
    appAfter: 'A real API: create, list, update and delete charts, saved in data/charts.json.',
    sections: [
      { letter: 'a', title: 'Validating input', exercises: ['4.1'] },
      { letter: 'b', title: 'The repository and the routes', exercises: ['4.2', '4.3'] },
      { letter: 'c', title: 'Saving to disk', exercises: ['4.4'] },
    ],
    exercises: [
      { id: '4.1', title: 'Validate what the network sends', dir: '4.1-validation', files: ['src/server/validation.ts'], needs: ['1.1'], concepts: ['unknown', 'type guards', 'error lists'] },
      { id: '4.2', title: 'A repository for charts', dir: '4.2-repository', files: ['src/server/repository.ts'], needs: [], concepts: ['classes', 'Map', 'defensive copies', 'dependency injection'] },
      { id: '4.3', title: 'The REST API', dir: '4.3-routes', files: ['src/server/routes.ts'], needs: ['4.1', '4.2'], concepts: ['Express', 'status codes', 'middleware order', 'supertest'] },
      { id: '4.4', title: 'Save to a file', dir: '4.4-file-store', files: ['src/server/fileStore.ts'], needs: ['4.2'], concepts: ['fs/promises', 'atomic writes', 'promise chains'] },
    ],
    notes: { id: 'p4.notes', label: 'Write the review answers for part 4 in notes/part4.md' },
    milestone: { id: 'p4.milestone', label: 'With npm run dev:server running, create, list and delete a chart with curl (see 4c) and restart the server: the data is still there' },
  },
  {
    id: 5, slug: slug(5), title: 'Full stack and the finish',
    goal: 'Connect the browser to your API, then add the last features: the photo importer.',
    appAfter: 'The finished app: charts saved on your server, pattern import, and chart-from-photo.',
    sections: [
      { letter: 'a', title: 'Talking to the API', exercises: ['5.1'] },
      { letter: 'b', title: 'Data hooks', exercises: ['5.2'] },
      { letter: 'c', title: 'Algorithms and photos', exercises: ['5.3', '5.4'] },
      { letter: 'd', title: 'Where to go from here', exercises: [] },
    ],
    exercises: [
      { id: '5.1', title: 'A typed API client', dir: '5.1-api-client', files: ['src/client/api/client.ts'], needs: [], concepts: ['fetch', 'generics', 'custom errors'] },
      { id: '5.2', title: 'A data hook', dir: '5.2-use-charts', files: ['src/client/hooks/useCharts.ts'], needs: ['5.1'], concepts: ['custom hooks', 'useEffect cleanup', 'useCallback'] },
      { id: '5.3', title: 'Count rounds from a photo', dir: '5.3-estimate-rounds', files: ['src/core/estimateRounds.ts'], needs: [], concepts: ['algorithms', 'signal processing', 'synthetic test data'] },
      { id: '5.4', title: 'Build the circle chart', dir: '5.4-circle-rows', files: ['src/core/circleRows.ts'], needs: ['1.3'], concepts: ['generating data', 'rules from a spec', 'property-style tests'] },
    ],
    notes: { id: 'p5.notes', label: 'Write the review answers for part 5 in notes/part5.md' },
    milestone: { id: 'p5.milestone', label: 'The finished app: reload (so it uses your server), import a pattern, import a photo, edit, save, delete; restart the server and your charts are still there' },
  },
];

export const ALL_EXERCISES: Array<Exercise & { part: Part & { slug: string } }> = PARTS.flatMap((part) => part.exercises.map((e) => ({ ...e, part })));

export function findExercise(id: string) {
  return ALL_EXERCISES.find((e) => e.id === id);
}

export function exercisePath(e: { part: { slug: string }; dir: string }): string {
  return `exercises/${e.part.slug}/${e.dir}`;
}

/** Id of the checklist item "read section 1a". */
export const readId = (part: Part, section: Section) => `p${part.id}${section.letter}.read`;

export const MANUAL_ITEMS: ManualItem[] = PARTS.flatMap((part) => [
  ...part.sections.map((s) => ({ id: readId(part, s), label: `Read ${part.id}${s.letter} ${s.title}` })),
  part.notes,
  part.milestone,
]);
