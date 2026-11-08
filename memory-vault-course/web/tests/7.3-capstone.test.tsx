// CAPSTONE (web). No new code to write: this runs the whole <App> against a fake server and checks that every component
// you built works together: login, library, note editor, series reader, sign out.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Library as LibraryData } from '@memory-vault/shared';
import { describe, expect, it } from 'vitest';
import { App } from '../src/App';
import { ApiError, type ApiClient } from '../src/api/client';

const library: LibraryData = {
  series: [{ id: 'S1', title: 'Hanoi trip', note: 'Six days, one backpack.', tags: 'travel', takenOn: '2023-11-02', coverId: 'p1', createdAt: 0 }],
  media: [
    { id: 'beach', kind: 'image', mime: 'image/jpeg', originalName: 'IMG_1.jpg', size: 1, title: 'Beach day', note: '', tags: 'family', takenOn: '2024-07-04', seriesId: null, position: 0, createdAt: 0 },
    ...['p1', 'p2', 'p3'].map((id, i) => ({ id, kind: 'image' as const, mime: 'image/jpeg', originalName: `${id}.jpg`, size: 1, title: `Photo ${id}`, note: '', tags: '', takenOn: '2023-11-02', seriesId: 'S1', position: i, createdAt: 0 })),
  ],
};

function fakeServer() {
  let signedIn = false;
  const calls: { method: string; path: string; body?: any }[] = [];
  const client: ApiClient = {
    getCsrf: () => 'tok',
    setCsrf: () => {},
    async request<T>(path: string, options: { method?: string; body?: any } = {}): Promise<T> {
      const method = options.method ?? 'GET';
      calls.push({ method, path, body: options.body });
      if (path === '/api/me') {
        if (!signedIn) throw new ApiError(401, 'Not signed in');
        return { username: 'alice', csrf: 'tok' } as T;
      }
      if (path === '/api/login') {
        if (options.body.password !== 'correct horse battery') throw new ApiError(401, 'Wrong username or password');
        signedIn = true;
        return { ok: true } as T;
      }
      if (path === '/api/logout') { signedIn = false; return { ok: true } as T; }
      if (path === '/api/library') return structuredClone(library) as T;
      return { ok: true } as T;
    },
  };
  return { client, calls };
}

async function signIn() {
  const server = fakeServer();
  render(<App client={server.client} />);
  await userEvent.type(await screen.findByLabelText('Username'), 'alice');
  await userEvent.type(screen.getByLabelText('Password'), 'correct horse battery');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  await screen.findByRole('heading', { name: '2024' });
  return server;
}

describe('7.3 capstone: the whole app', () => {
  it('shows the login form to a visitor and an error for a wrong password', async () => {
    const { client } = fakeServer();
    render(<App client={client} />);
    await userEvent.type(await screen.findByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Password'), 'not the password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong username or password');
  });

  it('signs in and shows the library by year, with the series as one stack', async () => {
    await signIn();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent).slice(0, 2)).toEqual(['2024', '2023']);
    expect(screen.getByRole('button', { name: /Beach day/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hanoi trip/ })).toHaveTextContent('3 items');
    expect(screen.getByText(/Sign out \(alice\)/)).toBeInTheDocument();
  });

  it('opens an item, edits the note and saves it', async () => {
    const { calls } = await signIn();
    await userEvent.click(screen.getByRole('button', { name: /Beach day/ }));
    await userEvent.type(await screen.findByLabelText('Notes'), 'We swam all afternoon.');
    await userEvent.click(screen.getByRole('button', { name: 'Save notes' }));
    expect(await screen.findByText('Saved ♥')).toBeInTheDocument();
    const patch = calls.find((c) => c.method === 'PATCH');
    expect(patch).toMatchObject({ path: '/api/media/beach', body: { title: 'Beach day', takenOn: '2024-07-04', tags: 'family', note: 'We swam all afternoon.' } });
  });

  it('opens a series, flips through it and reorders a photo', async () => {
    const { calls } = await signIn();
    await userEvent.click(screen.getByRole('button', { name: /Hanoi trip/ }));
    expect(await screen.findByRole('heading', { level: 3 })).toHaveTextContent('Photo 1 of 3');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Photo 2 of 3');
    await userEvent.click(screen.getByRole('button', { name: 'Move later' }));
    expect(calls.find((c) => c.method === 'PATCH')).toMatchObject({ path: '/api/series/S1', body: { ids: ['p1', 'p3', 'p2'] } });
  });

  it('signs out and shows the login form again', async () => {
    await signIn();
    await userEvent.click(screen.getByRole('button', { name: /Sign out/ }));
    expect(await screen.findByLabelText('Username')).toBeInTheDocument();
    expect(within(document.body).queryByRole('heading', { name: '2024' })).not.toBeInTheDocument();
  });
});
