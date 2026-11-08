import { describe, expect, it, vi } from 'vitest';
import { ChartRepository } from '@/server/repository';
import type { ChartInput } from '@/shared/types';
import { chart, row, st } from '../../_helpers/fixtures';

const input = (name = 'Coaster'): ChartInput => ({ name, mode: 'round', rows: [row('r1', [st('sc', 6)])] });
const clock = () => { let t = 1000; return () => ++t; };

describe('4.2 ChartRepository: create and get', () => {
  it('stores a chart with a new id and the time', () => {
    const repo = new ChartRepository({ now: () => 5000 });
    const created = repo.create(input());
    expect(created).toMatchObject({ name: 'Coaster', mode: 'round', updated: 5000 });
    expect(created.id).toEqual(expect.any(String));
    expect(created.rows).toEqual(input().rows);
    expect(repo.get(created.id)).toEqual(created);
  });

  it('gives every chart its own id', () => {
    const repo = new ChartRepository();
    expect(repo.create(input()).id).not.toBe(repo.create(input()).id);
  });

  it('get returns undefined for an unknown id', () => {
    expect(new ChartRepository().get('nope')).toBeUndefined();
  });

  it('keeps stored data safe from the caller (copies in and out)', () => {
    const repo = new ChartRepository();
    const body = input();
    const created = repo.create(body);
    body.name = 'changed after';
    body.rows.push(row('x'));
    created.rows[0].note = 'edited';
    const fetched = repo.get(created.id)!;
    expect(fetched.name).toBe('Coaster');
    expect(fetched.rows).toHaveLength(1);
    expect(fetched.rows[0].note).toBe('');
    fetched.rows.length = 0;
    expect(repo.get(created.id)!.rows).toHaveLength(1);
  });
});

describe('4.2 ChartRepository: list', () => {
  it('lists the most recently updated first', () => {
    const repo = new ChartRepository({ now: clock() });
    const a = repo.create(input('A'));
    const b = repo.create(input('B'));
    const c = repo.create(input('C'));
    expect(repo.list().map((x) => x.name)).toEqual(['C', 'B', 'A']);
    repo.update(a.id, input('A2'));
    expect(repo.list().map((x) => x.name)).toEqual(['A2', 'C', 'B']);
    expect(b.id).not.toBe(c.id);
  });

  it('starts from the initial charts without announcing them', () => {
    const onChange = vi.fn();
    const repo = new ChartRepository({ initial: [chart([], 'flat', 'Old')], onChange });
    expect(repo.list().map((x) => x.name)).toEqual(['Old']);
    expect(repo.get('c1')).toBeDefined();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('4.2 ChartRepository: update and remove', () => {
  it('replaces name, mode and rows, keeps the id and bumps the time', () => {
    const now = clock();
    const repo = new ChartRepository({ now });
    const created = repo.create(input());
    const updated = repo.update(created.id, { name: 'Leaf', mode: 'flat', rows: [] })!;
    expect(updated).toMatchObject({ id: created.id, name: 'Leaf', mode: 'flat', rows: [] });
    expect(updated.updated).toBeGreaterThan(created.updated);
    expect(repo.get(created.id)).toEqual(updated);
  });

  it('update returns undefined for an unknown id and stores nothing', () => {
    const repo = new ChartRepository();
    expect(repo.update('nope', input())).toBeUndefined();
    expect(repo.list()).toEqual([]);
  });

  it('remove says whether it removed something', () => {
    const repo = new ChartRepository();
    const { id } = repo.create(input());
    expect(repo.remove(id)).toBe(true);
    expect(repo.remove(id)).toBe(false);
    expect(repo.get(id)).toBeUndefined();
  });
});

describe('4.2 ChartRepository: onChange', () => {
  it('is called with the full list after create, update and remove', () => {
    const onChange = vi.fn();
    const repo = new ChartRepository({ onChange, now: clock() });
    const { id } = repo.create(input('A'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].map((c: { name: string }) => c.name)).toEqual(['A']);
    repo.update(id, input('B'));
    expect(onChange).toHaveBeenCalledTimes(2);
    repo.remove(id);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls[2][0]).toEqual([]);
  });

  it('is NOT called when nothing changed', () => {
    const onChange = vi.fn();
    const repo = new ChartRepository({ onChange });
    repo.update('nope', input());
    repo.remove('nope');
    expect(onChange).not.toHaveBeenCalled();
  });
});
