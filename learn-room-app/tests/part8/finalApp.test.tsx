// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/client/App';
import type { ApiClient } from '@/client/api';
import type { ItemsApi } from '@/client/useItems';
import { item, TODAY } from '../helpers';

function makeApi() {
  const server = [
    item({ id: 'milk', name: 'Milk', cat: 'dairy', exp: '2026-11-01', bought: '2026-11-02', price: 30_000, x: 10, y: 10 }),
    item({ id: 'rice', name: 'Rice', cat: 'pantry', bought: '2026-11-05', price: 20_000 }),
  ];
  let n = 0;
  const api: ItemsApi & Pick<ApiClient, 'parseBill'> = {
    listItems: vi.fn(async () => server.map((i) => ({ ...i }))),
    addItem: vi.fn(async (input) => {
      const created = item({ id: `new${++n}`, name: input.name, cat: input.cat, bought: input.bought ?? '2026-11-08', price: input.price ?? 0, qty: input.qty ?? 1 });
      server.push(created);
      return { item: created, replacedIds: [] };
    }),
    patchItem: vi.fn(async () => item()),
    deleteItem: vi.fn(async (id) => {
      server.splice(server.findIndex((i) => i.id === id), 1);
    }),
    parseBill: vi.fn(async () => ({
      format: 'receipt' as const,
      rows: [
        { name: 'Tea', cat: 'drinks' as const, exp: '', price: 50_000, qty: 2, bought: '2026-11-07' },
        { name: 'Honey', cat: 'pantry' as const, exp: '2027-01-01', price: 80_000, qty: 1, bought: '2026-11-07' },
      ],
    })),
  };
  return api;
}

describe('App, finished', () => {
  it('shows the pets right after the heading', async () => {
    render(<App api={makeApi()} today={TODAY} />);
    await screen.findByRole('heading', { name: 'Phòng Trữ Đồ' });
    expect(screen.getByRole('article', { name: 'Miso' })).toHaveTextContent('1 item expired');
  });

  it('dragging an item saves its new position', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON: () => ({}),
    });
    const api = makeApi();
    render(<App api={api} today={TODAY} />);
    const button = await screen.findByRole('button', { name: /^Rice/ });
    const room = screen.getByRole('group', { name: 'Room' });
    fireEvent.pointerDown(button, { clientX: 100, clientY: 120, pointerId: 1 });
    fireEvent.pointerMove(room, { clientX: 40, clientY: 150, pointerId: 1 });
    fireEvent.pointerUp(room, { clientX: 40, clientY: 150, pointerId: 1 });
    await waitFor(() => expect(api.patchItem).toHaveBeenCalledWith('rice', { x: 20, y: 75 }));
    expect(screen.getByRole('button', { name: /^Rice/ })).toHaveStyle({ left: '20%', top: '75%' });
    vi.restoreAllMocks();
  });

  it('a selected item can be deleted', async () => {
    const api = makeApi();
    render(<App api={api} today={TODAY} />);
    await userEvent.click(await screen.findByRole('button', { name: /^Rice/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete Rice' }));
    expect(api.deleteItem).toHaveBeenCalledWith('rice');
    expect(screen.queryByText('Selected: Rice')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Rice/ })).not.toBeInTheDocument();
  });

  it('imports a bill: read, untick one row, add the rest', async () => {
    const api = makeApi();
    render(<App api={api} today={TODAY} />);
    await screen.findByRole('heading');
    await userEvent.type(screen.getByLabelText('Bill text'), 'Tea 50.000');
    await userEvent.click(screen.getByRole('button', { name: 'Read bill' }));
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Add Tea' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add selected (1)' }));
    await waitFor(() => expect(api.addItem).toHaveBeenCalledTimes(1));
    expect(api.addItem).toHaveBeenCalledWith({ name: 'Honey', cat: 'pantry', price: 80_000, qty: 1, bought: '2026-11-07', exp: '2027-01-01' });
    expect(await screen.findByRole('button', { name: 'Honey (Pantry)' })).toBeInTheDocument();
  });

  it('does not show the bill panel when the client cannot parse bills', async () => {
    const { parseBill: _unused, ...withoutParse } = makeApi();
    render(<App api={withoutParse} today={TODAY} />);
    await screen.findByRole('heading');
    expect(screen.queryByLabelText('Bill text')).not.toBeInTheDocument();
  });

  it('shows an error when adding bill rows fails', async () => {
    const api = makeApi();
    api.addItem = vi.fn(async () => {
      throw new Error('Invalid request');
    });
    render(<App api={api} today={TODAY} />);
    await screen.findByRole('heading');
    await userEvent.type(screen.getByLabelText('Bill text'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Read bill' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Add selected (2)' }));
    expect(within(screen.getByRole('main')).getByText('Invalid request')).toBeInTheDocument();
  });
});
