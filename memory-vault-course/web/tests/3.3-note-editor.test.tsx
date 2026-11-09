import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NoteEditor } from '../src/components/NoteEditor';

const initial = { title: 'Beach day', takenOn: '2024-07-04', tags: 'family, beach', note: 'First time in the sea.' };

describe('3.3 NoteEditor', () => {
  it('starts with the values it was given', () => {
    render(<NoteEditor initial={initial} onSave={async () => {}} />);
    expect(screen.getByLabelText('Title')).toHaveValue('Beach day');
    expect(screen.getByLabelText('Date of the memory')).toHaveValue('2024-07-04');
    expect(screen.getByLabelText('Tags')).toHaveValue('family, beach');
    expect(screen.getByLabelText('Notes')).toHaveValue('First time in the sea.');
  });

  it('shows one chip per tag and updates them while typing', async () => {
    render(<NoteEditor initial={initial} onSave={async () => {}} />);
    const list = screen.getByRole('list', { name: 'Tag list' });
    expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['family', 'beach']);
    await userEvent.clear(screen.getByLabelText('Tags'));
    await userEvent.type(screen.getByLabelText('Tags'), 'a, A, b ,, c');
    expect(within(screen.getByRole('list', { name: 'Tag list' })).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['a', 'b', 'c']);
  });

  it('shows no tag list when there are no tags', async () => {
    render(<NoteEditor initial={{ ...initial, tags: '' }} onSave={async () => {}} />);
    expect(screen.queryByRole('list', { name: 'Tag list' })).not.toBeInTheDocument();
  });

  it('shows tag text as plain text and never as HTML', () => {
    const { container } = render(<NoteEditor initial={{ ...initial, tags: '<img src=x onerror=alert(1)>' }} onSave={async () => {}} />);
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('saves trimmed title and tags, and the note exactly as typed', async () => {
    const onSave = vi.fn(async () => {});
    render(<NoteEditor initial={initial} onSave={onSave} />);
    await userEvent.clear(screen.getByLabelText('Title'));
    await userEvent.type(screen.getByLabelText('Title'), '  Sea day  ');
    await userEvent.clear(screen.getByLabelText('Tags'));
    await userEvent.type(screen.getByLabelText('Tags'), ' sea ');
    await userEvent.clear(screen.getByLabelText('Notes'));
    await userEvent.type(screen.getByLabelText('Notes'), ' note with spaces ');
    await userEvent.click(screen.getByRole('button', { name: 'Save notes' }));
    expect(onSave).toHaveBeenCalledWith({ title: 'Sea day', takenOn: '2024-07-04', tags: 'sea', note: ' note with spaces ' });
  });

  it('says "Saved ♥" after saving and hides it again when something changes', async () => {
    render(<NoteEditor initial={initial} onSave={async () => {}} />);
    expect(screen.queryByText('Saved ♥')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save notes' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Saved ♥');
    await userEvent.type(screen.getByLabelText('Notes'), '!');
    expect(screen.queryByText('Saved ♥')).not.toBeInTheDocument();
  });

  it('disables the button while saving', async () => {
    let finish!: () => void;
    render(<NoteEditor initial={initial} onSave={() => new Promise<void>((r) => { finish = r; })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save notes' }));
    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
    finish();
    expect(await screen.findByRole('button', { name: 'Save notes' })).toBeEnabled();
  });

  it('shows the error when saving fails', async () => {
    render(<NoteEditor initial={initial} onSave={() => Promise.reject(new Error('Date must be YYYY-MM-DD'))} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save notes' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Date must be YYYY-MM-DD');
    expect(screen.queryByText('Saved ♥')).not.toBeInTheDocument();
  });
});
