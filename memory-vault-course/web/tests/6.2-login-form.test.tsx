import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../src/components/LoginForm';

function deferred<T = void>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe('6.2 LoginForm', () => {
  it('shows the fields and the button', () => {
    render(<LoginForm onSubmit={async () => {}} />);
    expect(screen.getByRole('heading', { name: 'Memory Vault' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('sends what was typed', async () => {
    const onSubmit = vi.fn(async () => {});
    render(<LoginForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Password'), 'correct horse');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).toHaveBeenCalledWith('alice', 'correct horse');
  });

  it('also submits with the Enter key', async () => {
    const onSubmit = vi.fn(async () => {});
    render(<LoginForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Password'), 'pw{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('alice', 'pw');
  });

  it('disables the button and says "Signing in…" while waiting', async () => {
    const wait = deferred();
    render(<LoginForm onSubmit={() => wait.promise} />);
    await userEvent.type(screen.getByLabelText('Username'), 'a');
    await userEvent.type(screen.getByLabelText('Password'), 'b');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('button', { name: 'Signing in…' })).toBeDisabled();
    wait.resolve();
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('shows the error when the login fails and lets the user try again', async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Wrong username or password')).mockResolvedValueOnce(undefined);
    render(<LoginForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Password'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong username or password');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('copes with something that is not an Error being thrown', async () => {
    render(<LoginForm onSubmit={() => Promise.reject('boom')} />);
    await userEvent.type(screen.getByLabelText('Username'), 'a');
    await userEvent.type(screen.getByLabelText('Password'), 'b');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
