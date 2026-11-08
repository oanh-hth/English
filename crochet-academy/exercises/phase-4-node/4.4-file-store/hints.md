## Hint 1
`try { text = await readFile(file, 'utf8') } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }`

## Hint 2
`await mkdir(dirname(file), { recursive: true });` then `writeFile(temp, JSON.stringify(charts, null, 2))` and `rename(temp, file)`.

## Hint 3
```ts
let queue: Promise<void> = Promise.resolve();
onChange: (charts) => {
  queue = queue.then(() => saveCharts(file, charts)).catch((e) => console.error('Could not save charts:', e));
}
```
The `.catch` turns a failure into a resolved promise, so the next save still runs.
