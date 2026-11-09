// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BillImport } from '@/client/BillImport';
import type { BillRow } from '@/domain/billTypes';

const rows: BillRow[] = [
  { name: 'Sữa tươi', cat: 'dairy', exp: '', price: 72_000, qty: 2, bought: '2026-11-07' },
  { name: 'Chuối', cat: 'produce', exp: '', price: 23_000, qty: 1, bought: '2026-11-07' },
];
const read = (ok = rows, format: 'receipt' | 'shopee' | 'dine-in' = 'receipt') => vi.fn(async () => ({ format, rows: ok }));
const text = (el: HTMLElement) => (el.textContent ?? '').replace(/\s/g, ' ');

async function readBill(parse = read(), onAdd = vi.fn()) {
  render(<BillImport parse={parse} onAdd={onAdd} />);
  await userEvent.type(screen.getByLabelText('Bill text'), 'Milk 10.000');
  await userEvent.click(screen.getByRole('button', { name: 'Read bill' }));
  return { parse, onAdd };
}

describe('BillImport', () => {
  it('cannot read an empty bill', () => {
    render(<BillImport parse={read()} onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Read bill' })).toBeDisabled();
  });

  it('sends the text to parse and lists the rows with prices', async () => {
    const { parse } = await readBill();
    expect(parse).toHaveBeenCalledWith('Milk 10.000');
    expect(await screen.findByText('Found: Shop receipt')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(text(items[0] as HTMLElement)).toContain('Sữa tươi x2 - 72.000 ₫');
    expect(screen.getByRole('checkbox', { name: 'Add Sữa tươi' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Add selected (2)' })).toBeEnabled();
  });

  it('names the other formats', async () => {
    await readBill(read(rows, 'shopee'));
    expect(await screen.findByText('Found: Shopee order')).toBeInTheDocument();
  });

  it('shows "Reading…" while waiting', async () => {
    let finish: (v: { format: 'receipt'; rows: BillRow[] }) => void = () => {};
    const parse = vi.fn(() => new Promise<{ format: 'receipt'; rows: BillRow[] }>((r) => { finish = r; }));
    render(<BillImport parse={parse} onAdd={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Bill text'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Read bill' }));
    expect(screen.getByRole('button', { name: 'Reading…' })).toBeDisabled();
    finish({ format: 'receipt', rows });
    expect(await screen.findByText('Found: Shop receipt')).toBeInTheDocument();
  });

  it('counts only ticked rows and adds only those', async () => {
    const { onAdd } = await readBill();
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Add Chuối' }));
    expect(screen.getByRole('button', { name: 'Add selected (1)' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Add selected (1)' }));
    expect(onAdd).toHaveBeenCalledWith([rows[0]]);
  });

  it('cannot add when nothing is ticked', async () => {
    await readBill();
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Add Sữa tươi' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Add Chuối' }));
    expect(screen.getByRole('button', { name: 'Add selected (0)' })).toBeDisabled();
  });

  it('clears the text and the list after adding', async () => {
    await readBill();
    await userEvent.click(await screen.findByRole('button', { name: 'Add selected (2)' }));
    expect(screen.getByLabelText('Bill text')).toHaveValue('');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('tells the user when nothing was found', async () => {
    await readBill(read([]));
    expect(await screen.findByRole('alert')).toHaveTextContent('No items found in this text');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('shows the error when reading fails', async () => {
    await readBill(vi.fn(async () => { throw new Error('Paste the text of the bill'); }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Paste the text of the bill');
  });
});
