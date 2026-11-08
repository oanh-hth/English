// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Room } from '@/client/Room';
import { item } from '../helpers';

describe('Room', () => {
  it('invites the user to add something when empty', () => {
    render(<Room items={[]} />);
    expect(screen.getByRole('group', { name: 'Room' })).toBeInTheDocument();
    expect(screen.getByText('The room is empty. Add your first item!')).toBeInTheDocument();
  });

  it('shows one button per item that is still in the room, named with its category', () => {
    render(<Room items={[item({ name: 'Milk', cat: 'dairy' }), item({ name: 'Cable', cat: 'electronics' }), item({ name: 'Old', used: true })]} />);
    expect(screen.getByRole('button', { name: 'Milk (Dairy & eggs)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cable (Electronics)' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Old/ })).not.toBeInTheDocument();
    expect(screen.queryByText('The room is empty. Add your first item!')).not.toBeInTheDocument();
  });

  it('positions items with percentages', () => {
    render(<Room items={[item({ name: 'Milk', cat: 'dairy', x: 25, y: 75 })]} />);
    const button = screen.getByRole('button', { name: /Milk/ });
    expect(button).toHaveStyle({ position: 'absolute', left: '25%', top: '75%' });
  });

  it('marks the selected item with aria-pressed', () => {
    const a = item({ id: 'a', name: 'A' });
    const b = item({ id: 'b', name: 'B' });
    render(<Room items={[a, b]} selectedId="b" />);
    expect(screen.getByRole('button', { name: /^A/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /^B/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('reports clicks', async () => {
    const onSelect = vi.fn();
    render(<Room items={[item({ id: 'a', name: 'A' })]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /^A/ }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('does not crash on click without onSelect', async () => {
    render(<Room items={[item({ name: 'A' })]} />);
    await userEvent.click(screen.getByRole('button', { name: /^A/ }));
  });
});
