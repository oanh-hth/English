import { useState, type FormEvent } from 'react';

export interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onSubmit(username, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Memory Vault</h1>
      <p className="muted">Your cosy little scrapbook. Sign in to peek inside!</p>
      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </label>
      {error && (
        <p role="alert" className="status">
          {error}
        </p>
      )}
      <button className="btn primary" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
