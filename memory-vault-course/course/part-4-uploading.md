# Part 4: Uploading originals

So far the library only holds the sample photos you seeded. Now you add your own: pick photos and videos in the browser, send them to the server, and get them back **exactly as they were**, with no recompression.

Uploads are where a web app meets the dangerous outside world. Files can be huge, lie about what they are, arrive half-finished, or never arrive. This part is about handling all of that calmly.

- [a) Never believe a file's name](#a-never-believe-a-files-name)
- [b) Uploading in three steps](#b-uploading-in-three-steps)
- [c) Streams and the upload routes](#c-streams-and-the-upload-routes)
- [d) Choosing files in the browser](#d-choosing-files-in-the-browser)
- [Self-check](#self-check) · [Run the app](#run-the-app)

---

## a) Never believe a file's name

Someone can rename `virus.html` to `holiday.png`. The browser also tells the server a `Content-Type`, but that is just a claim. If we stored the file and later served it as an image while it is really HTML with a script, we would be handing an attacker a way to run code in our site.

Real image and video formats begin with a fixed **signature**, sometimes called *magic bytes*. Every PNG starts with the bytes `89 50 4E 47 0D 0A 1A 0A`; every JPEG with `FF D8 FF`; MP4 and its relatives have the text `ftyp` at bytes 4 to 7, followed by a "brand" that tells photos (`heic`, `avif`) from videos. So we **look at the bytes**, not the name.

A file is read in JavaScript as a `Uint8Array`: a list of numbers 0 to 255.

```ts
const text = (b: Uint8Array, start: number, end: number) => String.fromCharCode(...b.subarray(start, end));
text(bytes, 0, 4) === 'GIF8';        // compare a few bytes as text
bytes[0] === 0xff && bytes[1] === 0xd8;   // or as numbers (0xff is 255 in hexadecimal)
```

### Exercise 4.1: Recognise a file by its bytes

> **File:** `shared/src/sniff.ts` · **Test:** `npm run ex -- 4.1`
> **Builds:** the guard that refuses anything that is not really an image or video.

The comment lists every signature. Write the `text` helper, then one `if` per format. Look at the "tells RIFF files apart" and "too short" tests: two formats share the start `RIFF`, and a file with fewer than 12 bytes can never be decided.

---

## b) Uploading in three steps

Why not one `POST` with the whole file? Because a video can be several gigabytes. The upload may take minutes, fail halfway, or go straight to a cloud bucket (part 7) where *our server never sees the bytes at all*. So we split it:

```
Browser                              Server
  │ 1. init: "a.jpg, 4 MB"             │  records a PENDING item, answers where to send the bytes
  │──────────────────────────────────▶│
  │ 2. send the file (untouched)       │  to the server (local) or to a signed cloud URL
  │ 3. complete: "I'm done"            │  checks it arrived, has the announced size, and REALLY is an image/video
  │──────────────────────────────────▶│  only then the item becomes visible (READY)
```

The browser is never trusted: step 3 checks everything again. And an item stays **invisible until verified**, so a half-finished or fake upload never shows up in the library.

Put this logic in a **service**, a plain class that coordinates repositories and storage. Services are easy to test because they know nothing about HTTP:

```ts
class UploadService {
  constructor(private deps: { media: MediaRepo; storage: Storage; maxBytes: number }) {}
  async init(userId, input) { /* ... */ }
  async complete(userId, id) { /* ... */ }
}
```

Errors carry meaning: throw `HttpError(415, 'Unsupported file type')` and the error handler turns it into the right response. Decide carefully what to do on each failure:

| Problem | Right reaction |
|---|---|
| bytes never arrived | keep the pending item (the browser may retry), answer 400 |
| wrong size | delete the file and the row, answer 400 |
| not an image or video | delete the file and the row, answer 415 |
| `complete` called twice | just answer with the same result |

### Exercise 4.2: Upload service

> **File:** `server/src/uploads/uploadService.ts` · **Test:** `npm run ex -- 4.2`
> **Builds:** the init, complete and clean-up workflow.

It reuses your `cleanFileName`, `isIsoDate` (1.1), `sniffFileType` (4.1) and `MediaRepo` (2.1). The tests use a fake in-memory storage (`server/test-support/memoryStorage.ts`): that is only possible because the service depends on the `Storage` *interface*.

---

## c) Streams and the upload routes

How do you receive a 2 GB file without holding 2 GB in memory? With a **stream**: data that flows in small chunks. A request body *is* a readable stream. You connect streams with `pipeline`:

```ts
import { pipeline } from 'node:stream/promises';
await pipeline(req, new SizeGuard(size), fs.createWriteStream(tmpPath));
```

`req` (the upload) flows through `SizeGuard` (given in `server/src/http/sizeGuard.ts`; it fails if more bytes arrive than announced) into a file. Two good habits:

- Write to a **temporary** name (`file.part`) and `rename` it when complete. A crash can then never leave a half-written file under the real name.
- If anything fails, delete the temporary file before rethrowing.

Docs: [Node streams](https://nodejs.org/api/stream.html).

The routes are three: `POST /api/uploads` (announce), `PUT /api/uploads/:id/data` (send, only for local storage), `POST /api/uploads/:id/complete` (finish). `PUT` is the right method for "store these bytes at this address".

### Exercise 4.3: Upload routes

> **Files:** `server/src/http/routes/uploads.ts` and `validation.ts` · **Test:** `npm run ex -- 4.3`

First replace the `uploadInitSchema` placeholder (`z.any()`) in `validation.ts`: name 1 to 500 characters, size a positive whole number, optional valid date. Then the routes. The `PUT` route has the most to think about, so follow its numbered comment.

<details><summary>Hint: the Content-Length check</summary>

`Number(req.headers['content-length'])` must equal the pending item's `size`; otherwise answer `400 Size mismatch` *before* writing anything.
</details>

---

## d) Choosing files in the browser

A file input gives you `File` objects (name, size, `lastModified`, and the bytes). The browser can send a `File` directly as the body of a `fetch`, with no conversion. `web/src/api/upload.ts` (given) runs the three steps for one file; read it, it is the browser's half of the diagram above.

```tsx
<input type="file" accept="image/*,video/*" multiple onChange={(e) => setStaged([...(e.target.files ?? [])])} />
```

After you pick files, the app shows an **upload panel** before sending anything. It does not upload; it only collects the user's decision and hands it to its parent as a *plan*. That keeps the component small and testable.

### Exercise 4.4: Upload panel (basic)

> **File:** `web/src/components/UploadPanel.tsx` · **Test:** `npm run ex -- 4.4`

This is the first of two exercises on the same file. For now: a heading ("3 files selected"), the list of file names, "Add to library" and "Cancel". Series mode comes in part 5.

---

## Self-check

1. Why do we check the file's *bytes* and not its name or Content-Type?
2. What are the three upload steps, and which one protects us from a disguised file?
3. Why stay `pending` until verified? What does the library show meanwhile?
4. Why write to a `.part` file and rename it?
5. What is a stream, and what does `pipeline` do for you?
6. Why does `UploadService` take a `Storage` instead of using the file system directly?

## Run the app

Restart nothing: the dev servers reload on save. Click **Upload**, choose a real photo from your computer, and press **Add to library**. It appears in the library at the right year. Open it: it is the original, byte for byte (check that `data/files` has a file of exactly the size shown by your system).

Now the attack: create a text file, name it `photo.png`, and upload it. The server must refuse it with a message about the file type, and nothing new should appear in `data/files`.

Tick the manual boxes and run `npm run progress`. **Stretch:** answer `413` when a user already has more than 1000 items, with a test.
