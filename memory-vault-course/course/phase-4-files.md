# Phase 4: Files and uploads

**Goal:** work with the file system, byte ranges and a multi-step upload workflow, and use an *interface* so storage can change later.
**You build:** local file storage, HTTP Range parsing and the upload service.
**Time:** about 3 to 4 hours.

## Learn first

### 1. The file system API
```ts
import fs from 'node:fs/promises';
await fs.stat(path);          // { size }  (throws code 'ENOENT' when missing)
const handle = await fs.open(path, 'r');  await handle.read(buffer, 0, n, 0);  await handle.close();
await fs.unlink(path);        // delete
```
Always `await`, and always close what you open (`try/finally`). Docs: https://nodejs.org/api/fs.html

### 2. Never trust a path
A key like `../../etc/passwd` could escape your folder (**directory traversal**). Validate keys against a strict pattern before touching the disk.

### 3. Interfaces let you swap parts
`server/src/storage/types.ts` (given) is the *contract* for storage. Local disk (4.1) and a cloud bucket (7.2) both obey it, so routes never care which one runs. This is "program to an interface, not an implementation".

### 4. Why uploads take three steps
1. **init**: "I will upload `a.jpg`, 4 MB." The server records a *pending* item and says where to send the bytes.
2. **send**: the bytes go to the storage (this server, or a cloud bucket directly).
3. **complete**: the server checks the file arrived, is the announced size, and *really* is an image or video (exercise 1.2). Only then it becomes visible.
This protects you from half-finished uploads, lies about size and disguised files, and works the same for cloud storage.

### 5. HTTP byte ranges
A video player asks for a slice: `Range: bytes=1000-1999`. The server answers `206 Partial Content` with just that slice and a `Content-Range` header. Without it, you cannot jump to the middle of a video. Both ends are *included*. Read: [MDN: Range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests).

### 6. Streams
A stream moves data in small pieces, so a 2 GB video never sits in memory. You will use `pipeline(req, guard, fileWriteStream)` in phase 5. Docs: https://nodejs.org/api/stream.html

### 7. Errors with meaning
`HttpError(415, '...')` (given in `server/src/http/errors.ts`) carries an HTTP status. Services throw it; one error handler turns it into the response.

## Self-check
1. Why check the real file type at *complete* and not at *init*?
2. What bad things could a key such as `../../x` do?
3. Why does `complete` keep the pending row when the file never arrived, but delete it when the size is wrong?
4. `bytes=-500` means what? And `bytes=500-`?
5. Why does the upload service depend on the `Storage` *interface* and not on local disk?

## Exercises

### 4.1 Local file storage  (`server/src/storage/localStorage.ts`)
**Builds:** keeping original files on disk under random names. Tests use a temporary folder.
<details><summary>Hint</summary>

Write `localPath(key)` first (validate with `/^[A-Za-z0-9_-]{8,128}$/`, then `path.join(dir, key)`), and use it in every other method. For "missing file" catch the error and check `(error as NodeJS.ErrnoException).code === 'ENOENT'`.
</details>

### 4.2 Byte ranges  (`server/src/http/range.ts`)
**Builds:** video seeking. A pure function, so quick to test. Handle the three shapes (`a-b`, `a-`, `-n`) and every invalid case in the table in the code comment.

### 4.3 Upload service  (`server/src/uploads/uploadService.ts`)
**Builds:** the init / complete workflow from the lesson. It reuses `cleanFileName`, `isIsoDate`, `sniffFileType` (phase 1) and `MediaRepo` (3.1), so finish those first.
Tests use a fake in-memory storage (`server/test-support/memoryStorage.ts`), which is only possible because you program to the interface.

## Finished the phase?
`npm run progress`, tick the manual boxes. **Stretch:** add a `maxFilesPerUser` limit to `init` that answers `413`.
