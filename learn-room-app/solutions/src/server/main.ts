import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { createApp } from './app';
import { loadItems, saveItems } from './fileStore';
import { ItemStore } from './store';

/** Start the real server: items live in data/items.json. Run with `npm run server`. */
const file = join(process.cwd(), 'data', 'items.json');
const initial = await loadItems(file);
const store = new ItemStore(initial, (items) => {
  void saveItems(file, items).catch((e) => console.error('Could not save', e));
});
const app = createApp({ store, today: () => new Date(), newId: () => randomUUID() });
const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
