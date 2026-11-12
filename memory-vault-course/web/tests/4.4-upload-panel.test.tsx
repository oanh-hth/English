import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UploadPanel } from '../src/components/UploadPanel';

const file = (name: string, day = Date.UTC(2024, 6, 4)) => new File(['x'], name, { type: 'image/jpeg', lastModified: day });
const names = () => within(screen.getByRole('list', { name: 'Files' })).getAllByRole('listitem').map((li) => li.textContent?.replace(/[‹›]/g, '').trim());

describe('4.4 UploadPanel: basic', () => {
  it('has no series choice and adds to the library', async () => {
    const onSubmit = vi.fn();
    const f = file('a.jpg');
    render(<UploadPanel files={[f]} onSubmit={onSubmit} onCancel={() => {}} />);
    expect(screen.getByRole('heading', { name: '1 file selected' })).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Series title')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Add to library' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ files: [f], mode: 'separate' }));
  });
});


describe('4.4 UploadPanel: several files and cancel', () => {
  it('lists every file by name', () => {
    render(<UploadPanel files={[file('a.jpg'), file('b.jpg'), file('c.jpg')]} onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('heading', { name: '3 files selected' })).toBeInTheDocument();
    expect(names()).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });

  it('cancels', async () => {
    const onCancel = vi.fn();
    render(<UploadPanel files={[file('a.jpg')]} onSubmit={() => {}} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
