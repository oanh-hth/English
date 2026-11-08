import { useState, type FormEvent } from "react";

export interface LoginFormProps {
  mode: "login" | "register";
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchMode: () => void;
}

export function LoginForm({ mode, onSubmit, onSwitchMode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const register = mode === "register";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address");
    if (register && password.length < 8) return setError("Use at least 8 characters for the password");
    if (register && password !== repeat) return setError("The two passwords don't match");
    setError(""); setBusy(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login" onSubmit={submit} noValidate>
      <h2>{register ? "Create your account" : "Sign in"}</h2>
      <label htmlFor="l-email">Email</label>
      <input id="l-email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
      <label htmlFor="l-pass">Password</label>
      <input id="l-pass" type="password" autoComplete={register ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} />
      {register && <>
        <label htmlFor="l-pass2">Repeat password</label>
        <input id="l-pass2" type="password" autoComplete="new-password" value={repeat} onChange={e => setRepeat(e.target.value)} />
      </>}
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" className="primary" disabled={busy}>{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</button>
      <button type="button" className="link" onClick={onSwitchMode}>{register ? "I already have an account" : "Create an account instead"}</button>
    </form>
  );
}
