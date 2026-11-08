// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RowCard, type RowCardProps } from '@/client/components/RowCard';
import { grp, row, st } from '../../_helpers/fixtures';

function setup(overrides: Partial<RowCardProps> = {}) {
  const props: RowCardProps = {
    row: row('r1', [st('mr'), grp(6, st('sc'), st('inc'))], { note: 'start here' }),
    index: 0,
    mode: 'round',
    active: false,
    onSelect: vi.fn(),
    onRemove: vi.fn(),
    onNoteChange: vi.fn(),
    ...overrides,
  };
  render(<RowCard {...props} />);
  return props;
}

describe('3.3 RowCard: what it shows', () => {
  it('labels rounds and rows by mode and index', () => {
    setup({ index: 2, mode: 'round' });
    expect(screen.getByRole('region', { name: 'Round 3' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Round 3' })).toBeInTheDocument();
  });

  it('uses "Row" in flat mode', () => {
    setup({ index: 0, mode: 'flat' });
    expect(screen.getByRole('heading', { name: 'Row 1' })).toBeInTheDocument();
  });

  it('shows how many stitches the row makes', () => {
    setup(); // MR + (sc, inc) x 6  ->  18 stitches
    expect(screen.getByTestId('stitch-count')).toHaveTextContent('18 sts');
  });

  it('lists each item as written pattern text', () => {
    setup();
    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['MR', '(sc, inc) × 6']);
  });

  it('uses UK names when asked', () => {
    setup({ row: row('r1', [st('dc', 3)]), uk: true });
    expect(screen.getByRole('listitem')).toHaveTextContent('3 tr');
  });

  it('shows a friendly message when the row is empty', () => {
    setup({ row: row('r1', []) });
    expect(screen.getByText('Empty. Pick a stitch and add it.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByTestId('stitch-count')).toHaveTextContent('0 sts');
  });

  it('marks the active row', () => {
    setup({ active: true });
    expect(screen.getByRole('region', { name: 'Round 1' })).toHaveAttribute('aria-current', 'true');
  });

  it('does not mark an inactive row', () => {
    setup({ active: false });
    expect(screen.getByRole('region', { name: 'Round 1' })).not.toHaveAttribute('aria-current');
  });
});

describe('3.3 RowCard: what it does', () => {
  it('selects the row when clicked', async () => {
    const props = setup();
    await userEvent.click(screen.getByRole('heading', { name: 'Round 1' }));
    expect(props.onSelect).toHaveBeenCalledWith('r1');
  });

  it('removes the row WITHOUT also selecting it', async () => {
    const props = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Delete Round 1' }));
    expect(props.onRemove).toHaveBeenCalledWith('r1');
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it('shows the note and reports edits with the new full text', async () => {
    const props = setup();
    const note = screen.getByRole('textbox', { name: 'Note for Round 1' });
    expect(note).toHaveValue('start here');
    await userEvent.type(note, '!');
    expect(props.onNoteChange).toHaveBeenLastCalledWith('r1', 'start here!');
  });

  it('keeps the delete button inside its own card', () => {
    setup();
    const card = screen.getByRole('region', { name: 'Round 1' });
    expect(within(card).getAllByRole('button')).toHaveLength(1);
  });
});
