// The map of the whole course. The scripts (progress, ex, solution) read this file, so keep it accurate.
// Paths are relative to the course folder.

export interface Exercise {
  id: string;
  title: string;
  /** The feature of Memory Vault this exercise builds. */
  feature: string;
  /** Test files that must all pass. */
  tests: string[];
  /** Files you edit (the stubs). */
  files: string[];
}

export interface ManualItem {
  id: string;
  text: string;
}

export interface Phase {
  id: number;
  title: string;
  goal: string;
  lesson: string;
  manual: ManualItem[];
  exercises: Exercise[];
}

const readLesson = (n: number): ManualItem[] => [
  { id: `${n}.read`, text: 'Read the lesson for this phase' },
  { id: `${n}.quiz`, text: 'Answer the self-check questions in your own words (write them in a notes file)' },
];

export const phases: Phase[] = [
  {
    id: 1,
    title: 'TypeScript foundations',
    goal: 'Write small, typed, pure functions and test them. These are shared by the server and the web app.',
    lesson: 'course/phase-1-typescript.md',
    manual: readLesson(1),
    exercises: [
      { id: '1.1', title: 'Text utilities', feature: 'Show sizes and dates nicely, validate dates, clean file names, split tags',
        tests: ['shared/tests/1.1-text.test.ts'], files: ['shared/src/text.ts'] },
      { id: '1.2', title: 'Recognise a file by its bytes', feature: 'Refuse uploads that are not really images or videos',
        tests: ['shared/tests/1.2-sniff.test.ts'], files: ['shared/src/sniff.ts'] },
      { id: '1.3', title: 'What the library shows', feature: 'Search, filter, group photos and series by year',
        tests: ['shared/tests/1.3-library.test.ts'], files: ['shared/src/library.ts'] },
    ],
  },
  {
    id: 2,
    title: 'Node.js: accounts and sessions',
    goal: 'Learn Node built-ins (crypto), classes, time, and Express middleware by building secure login.',
    lesson: 'course/phase-2-node-auth.md',
    manual: readLesson(2),
    exercises: [
      { id: '2.1', title: 'Password hashing', feature: 'Store passwords so a stolen database is useless',
        tests: ['server/tests/2.1-password.test.ts'], files: ['server/src/auth/password.ts'] },
      { id: '2.2', title: 'Sessions', feature: 'Keep a user signed in with a random, expiring token',
        tests: ['server/tests/2.2-sessions.test.ts'], files: ['server/src/auth/sessions.ts'] },
      { id: '2.3', title: 'Login lockout', feature: 'Lock out guessers after 5 wrong tries',
        tests: ['server/tests/2.3-login-limiter.test.ts'], files: ['server/src/auth/loginLimiter.ts'] },
      { id: '2.4', title: 'Auth middleware', feature: 'Protect every route: login check, CSRF token, origin check',
        tests: ['server/tests/2.4-auth-middleware.test.ts'], files: ['server/src/http/authMiddleware.ts'] },
    ],
  },
  {
    id: 3,
    title: 'Data with SQLite',
    goal: 'Model data in tables, write safe SQL, and keep rules (ownership, order, covers) inside repositories.',
    lesson: 'course/phase-3-sqlite.md',
    manual: readLesson(3),
    exercises: [
      { id: '3.1', title: 'Media repository', feature: 'Save, list, edit and delete photo records, per user',
        tests: ['server/tests/3.1-media-repo.test.ts'], files: ['server/src/db/mediaRepo.ts'] },
      { id: '3.2', title: 'Series repository', feature: 'Series with order, cover and automatic tidy-up',
        tests: ['server/tests/3.2-series-repo.test.ts'], files: ['server/src/db/seriesRepo.ts'] },
    ],
  },
  {
    id: 4,
    title: 'Files and uploads',
    goal: 'Work with the file system, byte ranges and an upload workflow. Use interfaces to swap storage later.',
    lesson: 'course/phase-4-files.md',
    manual: readLesson(4),
    exercises: [
      { id: '4.1', title: 'Local file storage', feature: 'Keep original files on disk under random names',
        tests: ['server/tests/4.1-local-storage.test.ts'], files: ['server/src/storage/localStorage.ts'] },
      { id: '4.2', title: 'Byte ranges', feature: 'Let videos seek (HTTP Range requests)',
        tests: ['server/tests/4.2-range.test.ts'], files: ['server/src/http/range.ts'] },
      { id: '4.3', title: 'Upload service', feature: 'Start, verify and finish an upload; clean up bad ones',
        tests: ['server/tests/4.3-upload-service.test.ts'], files: ['server/src/uploads/uploadService.ts'] },
    ],
  },
  {
    id: 5,
    title: 'The HTTP API',
    goal: 'Validate input with zod and build REST routes with Express. Test them with real HTTP requests.',
    lesson: 'course/phase-5-api.md',
    manual: readLesson(5),
    exercises: [
      { id: '5.1', title: 'Validate requests', feature: 'Reject bad input before it touches the database',
        tests: ['server/tests/5.1-validation.test.ts'], files: ['server/src/http/validation.ts'] },
      { id: '5.2', title: 'Library, item and series routes', feature: 'List the library; edit and delete items; manage series',
        tests: ['server/tests/5.2-library-routes.test.ts'], files: ['server/src/http/routes/library.ts'] },
      { id: '5.3', title: 'Upload and file routes', feature: 'Upload the original, then view or download it',
        tests: ['server/tests/5.3-upload-routes.test.ts'], files: ['server/src/http/routes/uploads.ts'] },
    ],
  },
  {
    id: 6,
    title: 'React with TypeScript',
    goal: 'Build the interface from typed components: props, state, effects, forms, keyboard and tests with Testing Library.',
    lesson: 'course/phase-6-react.md',
    manual: readLesson(6),
    exercises: [
      { id: '6.1', title: 'API client', feature: 'One typed place that talks to the server',
        tests: ['web/tests/6.1-api-client.test.ts'], files: ['web/src/api/client.ts'] },
      { id: '6.2', title: 'Login form', feature: 'The sign-in screen',
        tests: ['web/tests/6.2-login-form.test.tsx'], files: ['web/src/components/LoginForm.tsx'] },
      { id: '6.3', title: 'Note editor', feature: 'Write the title, date, tags and note of a memory',
        tests: ['web/tests/6.3-note-editor.test.tsx'], files: ['web/src/components/NoteEditor.tsx'] },
      { id: '6.4', title: 'Library view', feature: 'The scrapbook: years, tiles, series stacks, search and filter',
        tests: ['web/tests/6.4-library.test.tsx'], files: ['web/src/components/Library.tsx'] },
      { id: '6.5', title: 'Upload panel', feature: 'Choose many files, order them, make a series',
        tests: ['web/tests/6.5-upload-panel.test.tsx'], files: ['web/src/components/UploadPanel.tsx'] },
      { id: '6.6', title: 'Series reader', feature: 'Flip through a series; reorder, set the cover, remove',
        tests: ['web/tests/6.6-series-reader.test.tsx'], files: ['web/src/components/SeriesReader.tsx'] },
    ],
  },
  {
    id: 7,
    title: 'Hardening and capstone',
    goal: 'Add security headers, a cloud storage driver behind the same interface, then prove the whole app works together.',
    lesson: 'course/phase-7-capstone.md',
    manual: [
      ...readLesson(7),
      { id: '7.run', text: 'Run the real app (npm run dev:server and npm run dev:web), sign in, upload three photos as a series and write a note' },
      { id: '7.reflect', text: 'Write down three things you would change or add next' },
    ],
    exercises: [
      { id: '7.1', title: 'Security headers', feature: 'CSP and friends that block script injection and framing',
        tests: ['server/tests/7.1-security-headers.test.ts'], files: ['server/src/http/securityHeaders.ts'] },
      { id: '7.2', title: 'Cloud storage driver', feature: 'Same storage interface, backed by an object store such as R2',
        tests: ['server/tests/7.2-r2-storage.test.ts'], files: ['server/src/storage/r2Storage.ts'] },
      { id: '7.3', title: 'Capstone: everything together', feature: 'Server and web app work end to end (no new code: fix what fails)',
        tests: ['server/tests/7.3-capstone.test.ts', 'web/tests/7.3-capstone.test.tsx'], files: [] },
    ],
  },
];

export const allExercises = phases.flatMap((p) => p.exercises);
export const findExercise = (id: string) => allExercises.find((e) => e.id === id);
