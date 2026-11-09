// EXERCISE 6.6: the login form. Make `npm run ex -- 6.6` pass.
//
// A React component is a function that returns what the screen should look like for the current state.
// State (`useState`) is memory that survives re-renders; changing it re-draws the component.
// A "controlled" input shows a state value and updates it in onChange:
//     const [name, setName] = useState('');
//     <input value={name} onChange={(e) => setName(e.target.value)} />
// Docs: https://react.dev/learn  (State: A Component's Memory, Responding to Events, Reacting to Input with State)
import { useState, type FormEvent } from 'react';

export interface LoginFormProps {
  /** Called with what the user typed. It may take a while, and it rejects (throws) when the login is wrong. */
  onSubmit: (username: string, password: string) => Promise<void>;
}

/**
 * Render a form (inside <form className="..."> so the stylesheet works, any class names are fine) with:
 *   - <h1>Memory Vault</h1>
 *   - a text input labelled "Username" and a password input (type="password") labelled "Password".
 *     Wrap each input in a <label> with the label text, so `getByLabelText('Username')` finds it.
 *   - a submit button that says "Sign in"
 * On submit: call event.preventDefault() (otherwise the browser reloads the page), clear any old error, and await
 *   onSubmit(username, password).
 *   - While waiting: the button is disabled and says "Signing in…" (with the single character …).
 *   - When onSubmit rejects: show the error's message in a <p role="alert"> and enable the button again.
 *     (If the thing thrown is not an Error, show "Something went wrong".)
 */
export function LoginForm({ onSubmit }: LoginFormProps) {
  return <p>TODO: LoginForm</p>;
}
