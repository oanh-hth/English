// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Room } from '@/client/Room';
import { item } from '../helpers';

// jsdom has no layout, so we give the room a size: 400 x 200 pixels at (100, 50).
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 100, top: 50, width: 400, height: 200, right: 500, bottom: 250, x: 100, y: 50, toJSON: () => ({}),
  });
});
afterEach(() => vi.restoreAllMocks());

const milk = item({ id: 'milk', name: 'Milk', cat: 'dairy', x: 10, y: 10 });

function setup() {
  const onMove = vi.fn();
  const onSelect = vi.fn();
  render(<Room items={[milk]} onMove={onMove} onSelect={onSelect} />);
  return { onMove, onSelect, room: screen.getByRole('group', { name: 'Room' }), button: screen.getByRole('button', { name: /^Milk/ }) };
}

describe('Room dragging', () => {
  it('calls onMove once, with percentages, when the item is dropped somewhere else', () => {
    const { onMove, room, button } = setup();
    fireEvent.pointerDown(button, { clientX: 140, clientY: 70, pointerId: 1 });
    fireEvent.pointerMove(room, { clientX: 200, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(room, { clientX: 300, clientY: 150, pointerId: 1 });
    fireEvent.pointerUp(room, { clientX: 300, clientY: 150, pointerId: 1 });
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith('milk', 50, 50);
  });

  it('draws the item under the pointer while dragging', () => {
    const { room, button } = setup();
    fireEvent.pointerDown(button, { clientX: 140, clientY: 70, pointerId: 1 });
    fireEvent.pointerMove(room, { clientX: 500, clientY: 250, pointerId: 1 });
    expect(button).toHaveStyle({ left: '100%', top: '100%' });
  });

  it('clamps the drop position to the room', () => {
    const { onMove, room, button } = setup();
    fireEvent.pointerDown(button, { clientX: 140, clientY: 70, pointerId: 1 });
    fireEvent.pointerMove(room, { clientX: 9999, clientY: -50, pointerId: 1 });
    fireEvent.pointerUp(room, { clientX: 9999, clientY: -50, pointerId: 1 });
    expect(onMove).toHaveBeenCalledWith('milk', 100, 0);
  });

  it('does not call onMove when the pointer never moved', () => {
    const { onMove, room, button } = setup();
    fireEvent.pointerDown(button, { clientX: 140, clientY: 70, pointerId: 1 });
    fireEvent.pointerUp(room, { clientX: 140, clientY: 70, pointerId: 1 });
    expect(onMove).not.toHaveBeenCalled();
  });

  it('a plain click still selects, and does not move', async () => {
    const { onMove, onSelect } = setup();
    await userEvent.click(screen.getByRole('button', { name: /^Milk/ }));
    expect(onSelect).toHaveBeenCalledWith('milk');
    expect(onMove).not.toHaveBeenCalled();
  });

  it('a drag is not followed by a selecting click', () => {
    const { onSelect, room, button } = setup();
    fireEvent.pointerDown(button, { clientX: 140, clientY: 70, pointerId: 1 });
    fireEvent.pointerMove(room, { clientX: 300, clientY: 150, pointerId: 1 });
    fireEvent.pointerUp(room, { clientX: 300, clientY: 150, pointerId: 1 });
    fireEvent.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('cancel ends the drag without moving', () => {
    const { onMove, room, button } = setup();
    fireEvent.pointerDown(button, { clientX: 140, clientY: 70, pointerId: 1 });
    fireEvent.pointerMove(room, { clientX: 300, clientY: 150, pointerId: 1 });
    fireEvent.pointerCancel(room, { pointerId: 1 });
    fireEvent.pointerUp(room, { clientX: 300, clientY: 150, pointerId: 1 });
    expect(onMove).not.toHaveBeenCalled();
    expect(button).toHaveStyle({ left: '10%', top: '10%' });
  });

  it('moving the pointer without pressing an item does nothing', () => {
    const { onMove, room } = setup();
    fireEvent.pointerMove(room, { clientX: 300, clientY: 150, pointerId: 1 });
    fireEvent.pointerUp(room, { clientX: 300, clientY: 150, pointerId: 1 });
    expect(onMove).not.toHaveBeenCalled();
  });
});
