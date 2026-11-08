// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/client/App';
import type { ItemsApi } from '@/client/useItems';
import { item, TODAY } from '../helpers';

function api(initial = [
  item({ id: 'milk', name: 'Milk', cat: 'dairy', exp: '2026-11-09', bought: '2026-11-02', price: 30_000 }),
  item({ id: 'rice', name: 'Rice', cat: 'pantry', bought: '2026-10-03', price: 20_000 }),
]): ItemsApi {
  const server = [...initial];
  return {
    listItems: vi.fn(async () => server.map((i) => ({ ...i }))),
    addItem: vi.fn(async (input) => {
      const created = item({ id: 'new', name: input.name, cat: input.cat, bought: '2026-11-08', price: input.price ?? 0 });
      server.push(created);
      return { item: created, replacedIds: [] };
    }),
    patchItem: vi.fn(async () => item()),
    deleteItem: vi.fn(async (id) => {
      server.splice(server.findIndex((i) => i.id === id), 1);
    }),
  };
}

describe('App', () => {
  it('shows a loading message and then the whole screen', async () => {
    render(<App api={api()} today={TODAY} />);
    expect(screen.getByText('Loading your room…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Phòng Trữ Đồ' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Spending' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Needs attention' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Room' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to room' })).toBeInTheDocument();
  });

  it('computes spending from the loaded items', async () => {
    render(<App api={api()} today={TODAY} />);
    const card = await screen.findByRole('region', { name: 'Spending' });
    expect((card.textContent ?? '').replace(/\s/g, ' ')).toContain('30.000 ₫');
    expect(within(card).getByRole('status')).toHaveTextContent('Up 50% vs last month');
  });

  it('shows a load error', async () => {
    const broken = api();
    broken.listItems = vi.fn(async () => {
      throw new Error('Server is down');
    });
    render(<App api={broken} today={TODAY} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Server is down');
  });

  it('selecting an item shows its name', async () => {
    render(<App api={api()} today={TODAY} />);
    await userEvent.click(await screen.findByRole('button', { name: /^Rice/ }));
    expect(screen.getByText('Selected: Rice')).toBeInTheDocument();
  });

  it('adding an item puts it in the room', async () => {
    const fake = api();
    render(<App api={fake} today={TODAY} />);
    await screen.findByRole('heading');
    await userEvent.type(screen.getByLabelText('Name'), 'Tea');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'drinks');
    await userEvent.click(screen.getByRole('button', { name: 'Add to room' }));
    expect(await screen.findByRole('button', { name: 'Tea (Drinks)' })).toBeInTheDocument();
    expect(fake.addItem).toHaveBeenCalledWith({ name: 'Tea', cat: 'drinks', qty: 1 });
  });

  it('shows the message when adding fails', async () => {
    const fake = api();
    fake.addItem = vi.fn(async () => {
      throw new Error('Invalid request');
    });
    render(<App api={fake} today={TODAY} />);
    await screen.findByRole('heading');
    await userEvent.type(screen.getByLabelText('Name'), 'Tea');
    await userEvent.click(screen.getByRole('button', { name: 'Add to room' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid request');
  });

  it('"Used" in the attention list takes the item out of the room', async () => {
    const fake = api();
    render(<App api={fake} today={TODAY} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Used Milk' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Milk/ })).not.toBeInTheDocument());
    expect(fake.deleteItem).toHaveBeenCalledWith('milk');
    expect(screen.getByText('Nothing is about to expire')).toBeInTheDocument();
  });
});
