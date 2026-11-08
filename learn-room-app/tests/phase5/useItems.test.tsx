// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { useItems, type ItemsApi } from '@/client/useItems';
import { item } from '../helpers';

function fakeApi(initial = [item({ id: 'a', name: 'A', x: 10, y: 10 })]): ItemsApi & { server: ReturnType<typeof item>[] } {
  const server = [...initial];
  return {
    server,
    listItems: vi.fn(async () => server.map((i) => ({ ...i }))),
    addItem: vi.fn(async (input) => {
      const created = item({ id: 'new', name: input.name, cat: input.cat });
      server.push(created);
      return { item: created, replacedIds: [] };
    }),
    patchItem: vi.fn(async (id, patch) => ({ ...(server.find((i) => i.id === id) as ReturnType<typeof item>), ...patch })),
    deleteItem: vi.fn(async (id) => {
      server.splice(server.findIndex((i) => i.id === id), 1);
    }),
  };
}

describe('useItems', () => {
  it('starts loading and then has the items', async () => {
    const api = fakeApi();
    const { result } = renderHook(() => useItems(api));
    expect(result.current.status).toBe('loading');
    expect(result.current.items).toEqual([]);
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.items.map((i) => i.id)).toEqual(['a']);
    expect(api.listItems).toHaveBeenCalledTimes(1);
  });

  it('reports a load failure', async () => {
    const api = fakeApi();
    api.listItems = vi.fn(async () => {
      throw new Error('Server is down');
    });
    const { result } = renderHook(() => useItems(api));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Server is down');
  });

  it('add waits for the server and then shows the new item', async () => {
    const api = fakeApi();
    const { result } = renderHook(() => useItems(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => {
      await result.current.add({ name: 'Milk', cat: 'dairy' });
    });
    expect(result.current.items.map((i) => i.id)).toEqual(['a', 'new']);
  });

  it('add lets the error through so the form can show it', async () => {
    const api = fakeApi();
    api.addItem = vi.fn(async () => {
      throw new Error('Invalid request');
    });
    const { result } = renderHook(() => useItems(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await expect(act(() => result.current.add({ name: 'x', cat: 'dairy' }))).rejects.toThrow('Invalid request');
  });

  it('move is optimistic: the item moves before the server answers', async () => {
    const api = fakeApi();
    let finish: () => void = () => {};
    api.patchItem = vi.fn(() => new Promise((resolve) => { finish = () => resolve(item()); })) as ItemsApi['patchItem'];
    const { result } = renderHook(() => useItems(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.move('a', 80, 20);
    });
    expect(result.current.items[0]).toMatchObject({ x: 80, y: 20 });
    expect(api.patchItem).toHaveBeenCalledWith('a', { x: 80, y: 20 });
    await act(async () => {
      finish();
      await pending;
    });
    expect(result.current.items[0]).toMatchObject({ x: 80, y: 20 });
  });

  it('move rolls back (reloads from the server) and reports the error when the server fails', async () => {
    const api = fakeApi();
    api.patchItem = vi.fn(async () => {
      throw new Error('Network down');
    });
    const { result } = renderHook(() => useItems(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => {
      await result.current.move('a', 80, 20);
    });
    expect(result.current.items[0]).toMatchObject({ x: 10, y: 10 });
    expect(result.current.error).toBe('Network down');
    expect(api.listItems).toHaveBeenCalledTimes(2);
  });

  it('remove is optimistic and rolls back on failure', async () => {
    const api = fakeApi();
    const { result } = renderHook(() => useItems(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => {
      await result.current.remove('a');
    });
    expect(result.current.items).toEqual([]);

    const failing = fakeApi();
    failing.deleteItem = vi.fn(async () => {
      throw new Error('Nope');
    });
    const second = renderHook(() => useItems(failing));
    await waitFor(() => expect(second.result.current.status).toBe('ready'));
    await act(async () => {
      await second.result.current.remove('a');
    });
    expect(second.result.current.items.map((i) => i.id)).toEqual(['a']);
    expect(second.result.current.error).toBe('Nope');
  });

  it('keeps the same function identities between renders (so effects that use them do not loop)', async () => {
    const api = fakeApi();
    const { result, rerender } = renderHook(() => useItems(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const { add, move, remove } = result.current;
    rerender();
    expect(result.current.add).toBe(add);
    expect(result.current.move).toBe(move);
    expect(result.current.remove).toBe(remove);
  });

  it('does not update state after unmount', async () => {
    const api = fakeApi();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = renderHook(() => useItems(api));
    unmount();
    await Promise.resolve();
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
