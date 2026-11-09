import { Component, useState, type ReactNode } from 'react';
import { toISO } from '../domain/dates';
import { compareSpending } from '../domain/spending';
import type { BillRow } from '../domain/billTypes';
import type { Item } from '../domain/types';
import { reducerDemo } from './galleryData';
import { BillImport } from './BillImport';
import { ExpiringList } from './ExpiringList';
import { ItemForm } from './ItemForm';
import { Mascots } from './Mascots';
import { Room } from './Room';
import { SpendingCard } from './SpendingCard';

/**
 * Not an exercise. Open http://localhost:5173/#gallery to see every component you built, with example data,
 * before the whole App exists. A component that still throws "Not implemented yet" shows a lock instead.
 */
class Locked extends Component<{ exercise: string; children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const todo = error.message === 'Not implemented yet';
    return (
      <p style={{ color: todo ? '#888' : '#b00020' }}>
        {todo ? `🔒 Finish exercise ${this.props.exercise} to unlock this.` : `Error: ${error.message}`}
      </p>
    );
  }
}

function SpendingDemo({ items, today }: { items: Item[]; today: Date }) {
  return <SpendingCard spending={compareSpending(items, today)} />;
}

export function Gallery() {
  const today = new Date();
  const [items, setItems] = useState<Item[]>(() => reducerDemo(today));
  const [selected, setSelected] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const say = (text: string) => setLog((l) => [text, ...l].slice(0, 5));
  const fakeParse = async (text: string): Promise<{ format: 'receipt'; rows: BillRow[] }> => ({
    format: 'receipt',
    rows: [{ name: `Example from "${text.slice(0, 12)}"`, cat: 'pantry', exp: '', price: 12_000, qty: 1, bought: toISO(today) }],
  });
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1>Component gallery</h1>
      <p>Every piece you have built, with example data. Nothing here talks to the server.</p>
      <h2>Miso and Misu (8.2)</h2>
      <Locked exercise="8.2"><Mascots items={items} today={today} /></Locked>
      <h2>Spending (5.1)</h2>
      <Locked exercise="5.1"><SpendingDemo items={items} today={today} /></Locked>
      <h2>Needs attention (5.2)</h2>
      <Locked exercise="5.2"><ExpiringList items={items} today={today} onUse={(id) => setItems((l) => l.map((i) => (i.id === id ? { ...i, used: true } : i)))} /></Locked>
      <h2>Room (5.4, drag: 6.3)</h2>
      <Locked exercise="5.4"><Room items={items} selectedId={selected} onSelect={setSelected} onMove={(id, x, y) => setItems((l) => l.map((i) => (i.id === id ? { ...i, x, y } : i)))} /></Locked>
      <h2>Add an item (5.3)</h2>
      <Locked exercise="5.3"><ItemForm onSubmit={(input) => say(`submitted ${JSON.stringify(input)}`)} /></Locked>
      <h2>Import a bill (8.3)</h2>
      <Locked exercise="8.3"><BillImport parse={fakeParse} onAdd={(rows) => say(`would add ${rows.map((r) => r.name).join(', ')}`)} /></Locked>
      <h2>Log</h2>
      <ul>{log.map((l, i) => <li key={i}><code>{l}</code></li>)}</ul>
    </main>
  );
}
