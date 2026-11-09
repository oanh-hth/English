# 4c · Saving to disk

Right now a restart wipes every chart. In this section we write them to a file after every change, and read them back at startup. The repository interface does not change; we only plug a function into its `onChange` hook.

## Files and `async` / `await`
Reading and writing files takes time, and Node does not stop the whole server to wait. File functions return **promises**; `await` pauses *your function* until the promise settles while the rest of the program keeps running:

```ts
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';

async function loadCharts(file: string): Promise<Chart[]> {
  const text = await readFile(file, 'utf8');
  return JSON.parse(text);
}
```
An `async` function always returns a promise. Errors inside become **rejections**, and `try { await ... } catch (error) { ... }` handles them.

## A missing file is normal
The first time the server runs there is no file yet. That is *expected*, not an error. Node's error object has a `code`:
```ts
try { text = await readFile(file, 'utf8'); }
catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];   // no such file: start empty
  throw error;                                                          // anything else is a real problem
}
```
A file that exists but holds broken JSON, on the other hand, **is** an error, and the message should say which file, so the owner can look at it.

## Write safely
If the server crashes halfway through writing `charts.json`, the file is left half-written and **all** your data is gone. The standard defence is an **atomic write**: write the complete new content to a temporary file, then `rename` it over the real one. A rename is atomic: you see either the old file or the new one, never half of each.
```ts
await mkdir(dirname(file), { recursive: true });
await writeFile(`${file}.tmp`, JSON.stringify(charts, null, 2));
await rename(`${file}.tmp`, file);
```

## Two saves at once
Changes can arrive faster than the disk answers. Imagine two saves start together: the *older* one is slower and finishes last. The file ends up with the old data. To prevent that, run saves **one at a time, in order**, by chaining each onto the previous one:

```ts
let queue: Promise<void> = Promise.resolve();
onChange: (charts) => {
  queue = queue
    .then(() => saveCharts(file, charts))
    .catch((error) => console.error('Could not save charts:', error));
}
```
`.then` waits for the previous save. The `.catch` turns a failure into a resolved promise, so one failed save (a full disk) does not stop all later saves. `whenSaved()` simply returns `queue`, which lets a test wait until everything is written.

## Putting it together
`createPersistentRepository(file)` loads the charts, builds a `ChartRepository` with them as `initial` (the repository does **not** call `onChange` for those), and wires `onChange` to the save queue. Your repository from 4.2 is untouched: that is what the interface bought you.

## Try the whole API
Start the server and talk to it with `curl`:
```bash
npm run dev:server                                   # terminal 1
curl localhost:3001/api/health
curl -X POST localhost:3001/api/charts -H 'content-type: application/json' \
  -d '{"name":"Test","mode":"flat","rows":[]}'
curl localhost:3001/api/charts
curl -X PUT localhost:3001/api/charts/<id> -H 'content-type: application/json' \
  -d '{"name":"Renamed","mode":"round","rows":[]}'
curl -X DELETE -i localhost:3001/api/charts/<id>
```
(Use the `id` from the create answer. `-i` shows the status line.) Create a chart, stop the server with Ctrl-C, start it again, list the charts: yours is still there. Look inside `data/charts.json`.

The server also adapts to how far you have got: without 4.4 it keeps charts in memory and says so in the log; without 4.2 or 4.3 a stand-in API answers with a message telling you which exercise to build.

## Exercises 4.4.

| | | file you edit |
|---|---|---|
| **4.4** [Save to a file](../../exercises/part4-node/4.4-file-store/README.md) | `fs/promises`, atomic writes, promise chains | `src/server/fileStore.ts` |

When it is green: tick the items for part 4, answer the [review questions](README.md) in `notes/part4.md`, do the `curl` milestone, and continue with [part 5](../part5-fullstack/README.md).
