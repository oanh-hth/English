// The map of the whole course. The scripts (progress, ex, solution) read this file, so keep it accurate.
// Paths are relative to the course folder. Each PART ends with a running app that is bigger than before.

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

export interface Part {
  id: number;
  title: string;
  /** What the app can do when you finish this part. */
  goal: string;
  lesson: string;
  manual: ManualItem[];
  exercises: Exercise[];
}

const readLesson = (n: number): ManualItem[] => [
  { id: `${n}.read`, text: 'Read the material of this part' },
  { id: `${n}.quiz`, text: 'Answer the self-check questions in your own words (write them in a notes file)' },
];

export const phases: Part[] = [
  {
    id: 1,
    title: 'TypeScript and your first pure functions',
    goal: 'No server yet: you write the typed logic the whole app shares, and see it work in a text version of the scrapbook.',
    lesson: 'course/part-1-typescript.md',
    manual: [...readLesson(1), { id: '1.run', text: 'Run `npm run demo`, then `npm run demo -- hanoi`: the text scrapbook is grouped by year and searchable' }],
    exercises: [
      { id: '1.1', title: 'Text utilities', feature: 'Friendly sizes and dates, date validation, safe file names, tag splitting',
        tests: ['shared/tests/1.1-text.test.ts'], files: ['shared/src/text.ts'] },
      { id: '1.2', title: 'What the library shows', feature: 'Search, filter and group photos and series by year',
        tests: ['shared/tests/1.2-library.test.ts'], files: ['shared/src/library.ts'] },
    ],
  },
  {
    id: 2,
    title: 'Showing the library',
    goal: 'A real running app: Node serves your stored photos, React shows them as a scrapbook, with search and a filter.',
    lesson: 'course/part-2-showing-the-library.md',
    manual: [...readLesson(2), { id: '2.run', text: 'Seed sample photos and run the app (see the end of part 2): the scrapbook shows real images, search works' }],
    exercises: [
      { id: '2.1', title: 'Media repository', feature: 'Read, edit and delete photo records from SQLite, per user',
        tests: ['server/tests/2.1-media-repo.test.ts'], files: ['server/src/db/mediaRepo.ts'] },
      { id: '2.2', title: 'Local file storage', feature: 'Keep original files on disk under random names',
        tests: ['server/tests/2.2-local-storage.test.ts'], files: ['server/src/storage/localStorage.ts'] },
      { id: '2.3', title: 'Byte ranges', feature: 'Let videos seek (HTTP Range requests)',
        tests: ['server/tests/2.3-range.test.ts'], files: ['server/src/http/range.ts'] },
      { id: '2.4', title: 'Library and file routes', feature: 'GET the library and the original files',
        tests: ['server/tests/2.4-library-routes.test.ts'], files: ['server/src/http/routes/library.ts', 'server/src/http/routes/files.ts'] },
      { id: '2.5', title: 'API client', feature: 'One typed place in the browser that talks to the server',
        tests: ['web/tests/2.5-api-client.test.ts'], files: ['web/src/api/client.ts'] },
      { id: '2.6', title: 'Library view', feature: 'The scrapbook: years, tiles, series stacks, search and filter',
        tests: ['web/tests/2.6-library.test.tsx'], files: ['web/src/components/Library.tsx'] },
    ],
  },
  {
    id: 3,
    title: 'Writing notes',
    goal: 'Open a memory, write its title, date, tags and note, save it, or delete it. Bad input is refused with a clear message.',
    lesson: 'course/part-3-writing-notes.md',
    manual: [...readLesson(3), { id: '3.run', text: 'Run the app: open a photo, write a note, save, reload the page (it is still there); send a wrong date with curl and read the error' }],
    exercises: [
      { id: '3.1', title: 'Validate requests', feature: 'Reject bad input before it touches the database',
        tests: ['server/tests/3.1-validation.test.ts'], files: ['server/src/http/validation.ts'] },
      { id: '3.2', title: 'Edit and delete routes', feature: 'PATCH and DELETE a memory',
        tests: ['server/tests/3.2-media-routes.test.ts'], files: ['server/src/http/routes/media.ts'] },
      { id: '3.3', title: 'Note editor', feature: 'The form: title, date, tags with live chips, notes, "Saved ♥"',
        tests: ['web/tests/3.3-note-editor.test.tsx'], files: ['web/src/components/NoteEditor.tsx'] },
    ],
  },
  {
    id: 4,
    title: 'Uploading originals',
    goal: 'Upload photos and videos from the browser. Files are checked, stored untouched, and appear in the library.',
    lesson: 'course/part-4-uploading.md',
    manual: [...readLesson(4), { id: '4.run', text: 'Run the app: upload a real photo, check it opens at full quality; rename a text file to .png and upload it (it must be refused)' }],
    exercises: [
      { id: '4.1', title: 'Recognise a file by its bytes', feature: 'Refuse uploads that are not really images or videos',
        tests: ['shared/tests/4.1-sniff.test.ts'], files: ['shared/src/sniff.ts'] },
      { id: '4.2', title: 'Upload service', feature: 'Start, verify and finish an upload; clean up bad ones',
        tests: ['server/tests/4.2-upload-service.test.ts'], files: ['server/src/uploads/uploadService.ts'] },
      { id: '4.3', title: 'Upload routes', feature: 'Announce, send and complete an upload over HTTP',
        tests: ['server/tests/4.3-upload-routes.test.ts'], files: ['server/src/http/routes/uploads.ts', 'server/src/http/validation.ts'] },
      { id: '4.4', title: 'Upload panel', feature: 'Pick files in the browser and send them',
        tests: ['web/tests/4.4-upload-panel.test.tsx'], files: ['web/src/components/UploadPanel.tsx'] },
    ],
  },
  {
    id: 5,
    title: 'Series (albums)',
    goal: 'Group photos into a series with one shared note and a cover, then flip through it and reorder it.',
    lesson: 'course/part-5-series.md',
    manual: [...readLesson(5), { id: '5.run', text: 'Run the app: upload three photos as one series, flip through it with the arrow keys, reorder, set the cover, delete one photo' }],
    exercises: [
      { id: '5.1', title: 'Series repository', feature: 'Order, cover and automatic tidy-up, kept safe by transactions',
        tests: ['server/tests/5.1-series-repo.test.ts'], files: ['server/src/db/seriesRepo.ts'] },
      { id: '5.2', title: 'Series routes', feature: 'Create, edit and delete a series over HTTP',
        tests: ['server/tests/5.2-series-routes.test.ts'], files: ['server/src/http/routes/series.ts', 'server/src/http/routes/media.ts', 'server/src/http/validation.ts'] },
      { id: '5.3', title: 'Upload panel: series mode', feature: 'Choose "one series", order the files, name it',
        tests: ['web/tests/5.3-upload-panel-series.test.tsx'], files: ['web/src/components/UploadPanel.tsx'] },
      { id: '5.4', title: 'Series reader', feature: 'Flip through a series; reorder, set the cover, remove',
        tests: ['web/tests/5.4-series-reader.test.tsx'], files: ['web/src/components/SeriesReader.tsx'] },
    ],
  },
  {
    id: 6,
    title: 'Accounts and sign-in',
    goal: 'Until now everyone was a pre-made user. Now the app needs a real login: passwords, sessions, protection against common attacks.',
    lesson: 'course/part-6-accounts.md',
    manual: [...readLesson(6), { id: '6.run', text: 'Run the app with AUTH=real: create two accounts, check each user only sees their own photos, sign out, try 5 wrong passwords' }],
    exercises: [
      { id: '6.1', title: 'Password hashing', feature: 'Store passwords so a stolen database is useless',
        tests: ['server/tests/6.1-password.test.ts'], files: ['server/src/auth/password.ts'] },
      { id: '6.2', title: 'Sessions', feature: 'Keep a user signed in with a random, expiring token',
        tests: ['server/tests/6.2-sessions.test.ts'], files: ['server/src/auth/sessions.ts'] },
      { id: '6.3', title: 'Login lockout', feature: 'Lock out guessers after 5 wrong tries',
        tests: ['server/tests/6.3-login-limiter.test.ts'], files: ['server/src/auth/loginLimiter.ts'] },
      { id: '6.4', title: 'Auth middleware', feature: 'Protect every route: login check, CSRF token, origin check',
        tests: ['server/tests/6.4-auth-middleware.test.ts'], files: ['server/src/http/authMiddleware.ts'] },
      { id: '6.5', title: 'Sign-in routes', feature: 'POST /login, POST /logout, GET /me',
        tests: ['server/tests/6.5-auth-routes.test.ts'], files: ['server/src/http/routes/auth.ts'] },
      { id: '6.6', title: 'Login form', feature: 'The sign-in screen',
        tests: ['web/tests/6.6-login-form.test.tsx'], files: ['web/src/components/LoginForm.tsx'] },
    ],
  },
  {
    id: 7,
    title: 'Hardening and the finished app',
    goal: 'Security headers, a cloud-storage driver behind the same interface, and end-to-end proof that the whole app works.',
    lesson: 'course/part-7-finishing.md',
    manual: [
      ...readLesson(7),
      { id: '7.run', text: 'Run the finished app (AUTH=real) and use every feature once: sign in, upload, series, notes, download, sign out' },
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
