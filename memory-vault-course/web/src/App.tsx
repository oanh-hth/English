// Given: the application shell. Read it from top to bottom: it is every exercise of phase 6 wired together.
//
//   <App>          decides between the login screen and the signed-in screen
//   <Home>         loads the library, shows it, and opens the item / series dialogs and the upload panel
//
// It receives the API client as a prop (instead of creating it), so tests can give it a fake one.
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { seriesItems } from '@memory-vault/shared';
import type { ApiClient } from './api/client';
import { uploadFile } from './api/upload';
import { Library } from './components/Library';
import { LoginForm } from './components/LoginForm';
import { NoteEditor, type NoteValues } from './components/NoteEditor';
import { SeriesReader } from './components/SeriesReader';
import { UploadPanel, type UploadPlan } from './components/UploadPanel';
import { useLibrary } from './hooks/useLibrary';

type Auth = { state: 'loading' } | { state: 'out' } | { state: 'in'; username: string };

export function App({ client }: { client: ApiClient }) {
  const [auth, setAuth] = useState<Auth>({ state: 'loading' });

  const check = useCallback(async () => {
    try {
      const me = await client.request<{ username: string; csrf: string }>('/api/me');
      client.setCsrf(me.csrf);
      setAuth({ state: 'in', username: me.username });
    } catch {
      setAuth({ state: 'out' });
    }
  }, [client]);

  useEffect(() => {
    void check();
  }, [check]);

  async function login(username: string, password: string) {
    await client.request('/api/login', { method: 'POST', body: { username, password } });
    await check();
  }

  async function logout() {
    try {
      await client.request('/api/logout', { method: 'POST' });
    } catch {
      // already signed out
    }
    setAuth({ state: 'out' });
  }

  if (auth.state === 'loading') return <p className="muted">Loading…</p>;
  if (auth.state === 'out') {
    return (
      <section className="login">
        <LoginForm onSubmit={login} />
      </section>
    );
  }
  return <Home client={client} username={auth.username} onSignOut={logout} />;
}

function Home({ client, username, onSignOut }: { client: ApiClient; username: string; onSignOut: () => void }) {
  const { library, error, reload } = useLibrary(client);
  const [itemId, setItemId] = useState<string | null>(null);
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [staged, setStaged] = useState<File[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (error === 'Not signed in') onSignOut();
  }, [error, onSignOut]);

  const item = library.media.find((m) => m.id === itemId);
  const series = library.series.find((s) => s.id === seriesId);
  const photos = series ? seriesItems(library, series.id) : [];

  const patch = async (path: string, body: unknown) => {
    await client.request(path, { method: 'PATCH', body });
    await reload();
  };

  async function saveItem(values: NoteValues) {
    await patch(`/api/media/${itemId}`, values);
  }
  async function deleteItem() {
    if (!itemId || !window.confirm('Delete this item and its original file for good?')) return;
    await client.request(`/api/media/${itemId}`, { method: 'DELETE' });
    setItemId(null);
    await reload();
  }
  async function saveSeries(values: NoteValues) {
    await patch(`/api/series/${seriesId}`, values);
  }
  async function moveInSeries(id: string, direction: -1 | 1) {
    const ids = photos.map((p) => p.id);
    const from = ids.indexOf(id);
    [ids[from], ids[from + direction]] = [ids[from + direction], ids[from]];
    await patch(`/api/series/${seriesId}`, { ids });
  }
  async function removeFromSeries(id: string) {
    await patch(`/api/series/${seriesId}`, { ids: photos.map((p) => p.id).filter((x) => x !== id) });
    if (photos.length <= 1) setSeriesId(null);
  }

  function pick(event: ChangeEvent<HTMLInputElement>) {
    setStaged([...(event.target.files ?? [])]);
    event.target.value = '';
  }
  async function upload(plan: UploadPlan) {
    setStaged([]);
    const ids: string[] = [];
    for (const [index, file] of plan.files.entries()) {
      setMessage(`Uploading ${index + 1} of ${plan.files.length}: ${file.name}`);
      try {
        ids.push(await uploadFile(client, file));
      } catch (e) {
        setMessage(`${file.name}: ${e instanceof Error ? e.message : 'upload failed'}`);
        await reload();
        return;
      }
    }
    if (plan.mode === 'series' && ids.length > 1) {
      await client.request('/api/series', { method: 'POST', body: { title: plan.title || 'New series', takenOn: plan.date, ids } });
    }
    setMessage('');
    await reload();
  }

  return (
    <main>
      <header className="bar">
        <h1>Memory Vault</h1>
        <label className="btn primary" htmlFor="pick">
          Upload
        </label>
        <input id="pick" type="file" accept="image/*,video/*,.heic,.heif" multiple hidden onChange={pick} />
        <button className="btn" type="button" onClick={onSignOut}>
          Sign out ({username})
        </button>
      </header>
      {message && <p role="status">{message}</p>}
      {error && error !== 'Not signed in' && <p role="alert">{error}</p>}
      {staged.length > 0 && <UploadPanel files={staged} onSubmit={upload} onCancel={() => setStaged([])} />}

      <Library library={library} onOpenItem={setItemId} onOpenSeries={setSeriesId} />

      {item && (
        <div className="veil">
          <div className="reader">
            <div className="stage">
              {item.kind === 'video' ? <video src={`/api/media/${item.id}/file`} controls /> : <img src={`/api/media/${item.id}/file`} alt={item.title || item.originalName} />}
            </div>
            <div className="side">
              <NoteEditor key={item.id} initial={{ title: item.title, takenOn: item.takenOn, tags: item.tags, note: item.note }} onSave={saveItem} />
              <div className="row">
                <a className="btn" href={`/api/media/${item.id}/file?download=1`}>
                  Download original
                </a>
                <button className="btn danger" type="button" onClick={deleteItem}>
                  Delete
                </button>
                <button className="btn" type="button" onClick={() => setItemId(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {series && (
        <div className="veil">
          <div className="reader">
            <SeriesReader
              key={series.id}
              series={series}
              photos={photos}
              onMove={moveInSeries}
              onSetCover={(id) => patch(`/api/series/${series.id}`, { coverId: id })}
              onRemove={removeFromSeries}
              onClose={() => setSeriesId(null)}
            />
            <NoteEditor key={`${series.id}-notes`} initial={{ title: series.title, takenOn: series.takenOn, tags: series.tags, note: series.note }} onSave={saveSeries} />
          </div>
        </div>
      )}
    </main>
  );
}
