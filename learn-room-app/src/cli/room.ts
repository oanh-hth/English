/**
 * Your room in the terminal. Run it with `npm run room`.
 *
 *   npm run room                          report: spending, what needs attention, idle items, the pets
 *   npm run room -- seed                  create data/items.json with a few example items
 *   npm run room -- add "Sữa tươi" --price 30000 --exp 2026-12-01 [--cat dairy] [--qty 2]
 *   npm run room -- bill samples/shopee.txt [--add]
 *
 * This file is NOT an exercise. It calls the functions YOU write in parts 1 to 3 (and 8), so it is also a
 * progress meter: a section whose function is not finished yet prints "locked" with the exercise to do.
 * The server (part 4) reads and writes the same data/items.json.
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { toISO, daysLeft } from '../domain/dates';
import { dormantList, idleDays } from '../domain/dormant';
import { needsAttention, whenText } from '../domain/expiry';
import { guessCategory } from '../domain/guess';
import { mascotMessages } from '../domain/mascots';
import { applyRebuy } from '../domain/rebuy';
import { compareSpending, formatVND } from '../domain/spending';
import { isCategoryId, makeItem, type CategoryId, type Item } from '../domain/types';
import { parseBillText } from '../domain/bills';

const FILE = join(process.cwd(), 'data', 'items.json');
const today = new Date();
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

function load(): Item[] {
  return existsSync(FILE) ? (JSON.parse(readFileSync(FILE, 'utf8')) as Item[]) : [];
}
function save(items: Item[]): void {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(items, null, 2));
}

/** Run one section. If it needs a function you have not written yet, say which exercise unlocks it. */
function section(title: string, exercise: string, body: () => void): void {
  console.log(bold(`\n${title}`));
  try {
    body();
  } catch (error) {
    if (error instanceof Error && error.message === 'Not implemented yet') console.log(dim(`  🔒 locked: finish exercise ${exercise} (npm run learn -- show ${exercise})`));
    else throw error;
  }
}

function report(): void {
  const items = load();
  if (items.length === 0) console.log(dim('The room is empty. Try: npm run room -- seed'));
  console.log(bold(`Your room, ${toISO(today)}`) + dim(`  (${items.filter((i) => !i.used).length} items)`));

  section('Spending', '1.4', () => {
    const s = compareSpending(items, today);
    const change = s.changePct === null ? 'no data for last month' : `${s.changePct >= 0 ? '+' : ''}${Math.round(s.changePct)}% vs the same days last month`;
    console.log(`  This month  ${formatVND(s.current)}   ${dim(change)}`);
    console.log(`  Last month  ${formatVND(s.previousTotal)} in total`);
  });

  section('Needs attention', '1.3', () => {
    const list = needsAttention(items, today);
    if (list.length === 0) console.log('  Nothing is about to expire');
    for (const i of list) console.log(`  ${i.name.padEnd(24)} ${whenText(daysLeft(i, today) as number)}`);
  });

  section('Idle items', '2.3', () => {
    const list = dormantList(items, today);
    if (list.length === 0) console.log('  Nothing is gathering dust');
    for (const i of list) console.log(`  ${i.name.padEnd(24)} untouched for ${idleDays(i, today)} days`);
  });

  section('Miso and Misu', '8.1', () => {
    for (const m of mascotMessages(items, today)) console.log(`  ${m.who} (${m.mood}): ${m.line}`);
  });
  console.log();
}

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

function add(args: string[]): void {
  const name = args[0];
  if (!name || name.startsWith('--')) return void console.log('Usage: npm run room -- add "<name>" [--price N] [--exp YYYY-MM-DD] [--qty N] [--cat id]');
  const catArg = flag(args, 'cat');
  let cat: CategoryId;
  if (catArg !== undefined) {
    if (!isCategoryId(catArg)) return void console.log(`Unknown category "${catArg}"`);
    cat = catArg;
  } else {
    cat = guessCategory(name); // exercise 2.4
    console.log(dim(`  category guessed: ${cat}`));
  }
  const price = flag(args, 'price');
  const qty = flag(args, 'qty');
  const exp = flag(args, 'exp');
  const item = makeItem( // exercise 1.1
    { name, cat, ...(price ? { price: Number(price) } : {}), ...(qty ? { qty: Number(qty) } : {}), ...(exp ? { exp } : {}) },
    { id: randomUUID(), today: toISO(today) },
  );
  const { items, replaced } = applyRebuy([...load(), item], [item]); // exercise 2.2
  save(items);
  console.log(`Added ${item.name} (${item.cat}).`);
  for (const r of replaced) console.log(`  ${r.older.name} from ${r.older.bought} left the room: you bought it again.`);
}

function bill(args: string[]): void {
  const file = args[0];
  if (!file || file.startsWith('--')) return void console.log('Usage: npm run room -- bill <file.txt> [--add]');
  const rows = parseBillText(readFileSync(file, 'utf8'), today); // part 3
  if (rows.length === 0) return void console.log('No items found in this bill.');
  for (const r of rows) console.log(`  ${r.bought}  ${r.name.padEnd(28)} x${r.qty}  ${formatVND(r.price).padStart(12)}  ${dim(r.cat)}`);
  if (!args.includes('--add')) return void console.log(dim('\nAdd them to the room with --add'));
  let items = load();
  for (const r of rows) {
    const item = makeItem({ name: r.name, cat: r.cat, price: r.price, qty: r.qty, bought: r.bought, ...(r.exp ? { exp: r.exp } : {}) }, { id: randomUUID(), today: toISO(today) });
    items = applyRebuy([...items, item], [item]).items;
  }
  save(items);
  console.log(`\nAdded ${rows.length} items.`);
}

/** Example data relative to today, written without using any of your code. */
function seed(): void {
  const day = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return toISO(d);
  };
  const make = (name: string, cat: CategoryId, boughtAgo: number, price: number, expIn?: number, x = 50, y = 60): Item => ({
    id: randomUUID(), name, cat, bought: day(-boughtAgo), exp: expIn === undefined ? '' : day(expIn), price, qty: 1, x, y, used: false,
  });
  save([
    make('Sữa tươi 1L', 'dairy', 3, 32_000, 1, 20, 30),
    make('Phô mai Cheddar', 'dairy', 5, 52_000, -2, 35, 25),
    make('Chuối 1kg', 'produce', 2, 23_000, 4, 60, 70),
    make('Gạo ST25 5kg', 'pantry', 20, 180_000, 300, 80, 40),
    make('Bỉm Huggies', 'baby', 45, 420_000, undefined, 15, 75),
    make('Bút bi Thiên Long', 'stationery', 60, 25_000, undefined, 70, 20),
    make('Dầu gội Clear', 'care', 70, 95_000, 400, 45, 50),
    make('Sữa tươi 1L', 'dairy', 38, 30_000, undefined, 90, 80),
    make('Cáp sạc nhanh', 'electronics', 12, 150_000, undefined, 55, 15),
  ]);
  console.log(`Wrote ${FILE}`);
}

const [command = 'report', ...args] = process.argv.slice(2);
switch (command) {
  case 'report': report(); break;
  case 'seed': seed(); break;
  case 'add': add(args); break;
  case 'bill': bill(args); break;
  default: console.log(`Unknown command "${command}". Try: report, seed, add, bill`);
}
