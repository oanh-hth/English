// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, type ApiClient } from '@/client/api/client';
import { useCharts } from '@/client/hooks/useCharts';
import type { Chart } from '@/shared/types';
import { chart } from '../../_helpers/fixtures';

const named = (id: string, name: string): Chart => ({ ...chart([], 'flat', name), id });
const input = { name: 'New', mode: 'flat' as const, rows: [] };

function fakeApi(overrides: Partial<ApiClient> = {}): ApiClient {
  return {
    list: vi.fn(async () => [named('1', 'One'), named('2', 'Two')]),
    create: vi.fn(async () => named('3', 'New')),
    update: vi.fn(async () => named('1', 'One')),
    remove: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe('5.2 useCharts: loading', () => {
  it('starts loading, then shows the charts', async () => {
    const api = fakeApi();
    const { result } = renderHook(() => useCharts(api));
    expect(result.current.status).toBe('loading');
    expect(result.current.charts).toEqual([]);
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.charts.map((c) => c.name)).toEqual(['One', 'Two']);
    expect(result.current.error).toBeNull();
    expect(api.list).toHaveBeenCalledTimes(1);
  });

  it('reports a server error with its messages', async () => {
    const api = fakeApi({ list: vi.fn(async () => { throw new ApiError(500, ['disk full', 'try later']); }) });
    const { result } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('disk full, try later');
  });

  it('reports a network error with its message', async () => {
    const api = fakeApi({ list: vi.fn(async () => { throw new TypeError('Failed to fetch'); }) });
    const { result } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Failed to fetch');
  });

  it('does not load again just because the component re-rendered', async () => {
    const api = fakeApi();
    const { result, rerender } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    rerender();
    rerender();
    expect(api.list).toHaveBeenCalledTimes(1);
  });
});

describe('5.2 useCharts: actions', () => {
  it('create puts the new chart first and returns it', async () => {
    const api = fakeApi();
    const { result } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    let created: Chart | undefined;
    await act(async () => { created = await result.current.create(input); });
    expect(created?.id).toBe('3');
    expect(result.current.charts.map((c) => c.id)).toEqual(['3', '1', '2']);
    expect(api.create).toHaveBeenCalledWith(input);
  });

  it('create that fails rejects and leaves the list alone', async () => {
    const api = fakeApi({ create: vi.fn(async () => { throw new ApiError(400, ['bad']); }) });
    const { result } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => { await expect(result.current.create(input)).rejects.toBeInstanceOf(ApiError); });
    expect(result.current.charts).toHaveLength(2);
    expect(result.current.status).toBe('ready');
  });

  it('remove deletes on the server and then from the list', async () => {
    const api = fakeApi();
    const { result } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => { await result.current.remove('1'); });
    expect(api.remove).toHaveBeenCalledWith('1');
    expect(result.current.charts.map((c) => c.id)).toEqual(['2']);
  });

  it('remove that fails keeps the chart', async () => {
    const api = fakeApi({ remove: vi.fn(async () => { throw new ApiError(404, ['Chart not found']); }) });
    const { result } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => { await expect(result.current.remove('1')).rejects.toBeInstanceOf(ApiError); });
    expect(result.current.charts).toHaveLength(2);
  });

  it('refresh loads again', async () => {
    const list = vi.fn().mockResolvedValueOnce([named('1', 'One')]).mockResolvedValueOnce([named('9', 'Nine')]);
    const api = fakeApi({ list }); // create the api ONCE: a new object on every render would make the hook reload forever
    const { result } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.charts[0]?.id).toBe('1'));
    await act(async () => { await result.current.refresh(); });
    expect(result.current.charts.map((c) => c.id)).toEqual(['9']);
    expect(result.current.status).toBe('ready');
  });

  it('keeps the same function identities between renders', async () => {
    const api = fakeApi();
    const { result, rerender } = renderHook(() => useCharts(api));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const before = [result.current.create, result.current.remove, result.current.refresh];
    rerender();
    expect([result.current.create, result.current.remove, result.current.refresh]).toEqual(before);
  });
});

describe('5.2 useCharts: unmounting', () => {
  it('ignores an answer that arrives after unmount', async () => {
    let finish: (charts: Chart[]) => void = () => {};
    const api = fakeApi({ list: vi.fn(() => new Promise<Chart[]>((resolve) => { finish = resolve; })) });
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = renderHook(() => useCharts(api));
    unmount();
    await act(async () => { finish([named('1', 'One')]); });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
