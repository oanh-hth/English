import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UploadPanel } from '../src/components/UploadPanel';

const file = (name: string, day = Date.UTC(2024, 6, 4)) => new File(['x'], name, { type: 'image/jpeg', lastModified: day });
const names = () => within(screen.getByRole('list', { name: 'Files' })).getAllByRole('listitem').map((li) => li.textContent?.replace(/[‹›]/g, '').trim());

describe('5.3 UploadPanel: series mode', () => {
  const three = () => [file('a.jpg', Date.UTC(2024, 6, 4)), file('b.jpg', Date.UTC(2023, 10, 2)), file('c.jpg', Date.UTC(2024, 0, 1))];

  it('starts in series mode with the earliest date', () => {
    render(<UploadPanel files={three()} onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('heading', { name: '3 files selected' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /One series/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Separate items/ })).not.toBeChecked();
    expect(screen.getByLabelText('Date')).toHaveValue('2023-11-02');
    expect(screen.getByRole('button', { name: 'Create series' })).toBeInTheDocument();
    expect(names()).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });

  it('reorders files with the arrows and disables them at the ends', async () => {
    render(<UploadPanel files={three()} onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: 'Move a.jpg earlier' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move c.jpg later' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Move c.jpg earlier' }));
    expect(names()).toEqual(['a.jpg', 'c.jpg', 'b.jpg']);
    await userEvent.click(screen.getByRole('button', { name: 'Move a.jpg later' }));
    expect(names()).toEqual(['c.jpg', 'a.jpg', 'b.jpg']);
  });

  it('submits the series with the chosen order, title and date', async () => {
    const onSubmit = vi.fn();
    const files = three();
    render(<UploadPanel files={files} onSubmit={onSubmit} onCancel={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Move c.jpg earlier' }));
    await userEvent.type(screen.getByLabelText('Series title'), '  Hanoi trip ');
    await userEvent.click(screen.getByRole('button', { name: 'Create series' }));
    expect(onSubmit).toHaveBeenCalledWith({ files: [files[0], files[2], files[1]], mode: 'series', title: 'Hanoi trip', date: '2023-11-02' });
  });

  it('can switch to separate items, which hides the series fields and arrows', async () => {
    const onSubmit = vi.fn();
    render(<UploadPanel files={three()} onSubmit={onSubmit} onCancel={() => {}} />);
    await userEvent.click(screen.getByRole('radio', { name: /Separate items/ }));
    expect(screen.queryByLabelText('Series title')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Move a.jpg/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Add to library' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ mode: 'separate' }));
    expect(onSubmit.mock.calls[0][0].files).toHaveLength(3);
  });

  it('cancels', async () => {
    const onCancel = vi.fn();
    render(<UploadPanel files={three()} onSubmit={() => {}} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
