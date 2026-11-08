import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MediaItem, Series } from '@memory-vault/shared';
import { describe, expect, it, vi } from 'vitest';
import { SeriesReader } from '../src/components/SeriesReader';

const photo = (id: string, position: number, over: Partial<MediaItem> = {}): MediaItem => ({
  id, kind: 'image', mime: 'image/jpeg', originalName: `${id}.jpg`, size: 1, title: `Photo ${id}`, note: '', tags: '', takenOn: '', seriesId: 'S', position, createdAt: 0, ...over,
});
const series: Series = { id: 'S', title: 'Hanoi trip', note: 'Six days, one backpack.', tags: '', takenOn: '2023-11-02', coverId: 'a', createdAt: 0 };
const photos = [photo('a', 0), photo('b', 1), photo('c', 2)];

function setup(over: Partial<React.ComponentProps<typeof SeriesReader>> = {}) {
  const handlers = { onMove: vi.fn(), onSetCover: vi.fn(), onRemove: vi.fn(), onClose: vi.fn() };
  render(<SeriesReader series={series} photos={photos} {...handlers} {...over} />);
  return handlers;
}

describe('6.6 SeriesReader: showing', () => {
  it('shows the series title, its note and the first photo', () => {
    setup();
    expect(screen.getByRole('heading', { level: 2, name: 'Hanoi trip' })).toBeInTheDocument();
    expect(screen.getByText('Six days, one backpack.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Photo a' })).toHaveAttribute('src', '/api/media/a/file');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Photo 1 of 3');
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('can start at another photo', () => {
    setup({ startIndex: 2 });
    expect(screen.getByRole('img', { name: 'Photo c' })).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('shows a video player for videos', () => {
    const { container } = render(<SeriesReader series={series} photos={[photo('v', 0, { kind: 'video', mime: 'video/mp4' })]} onMove={() => {}} onSetCover={() => {}} onRemove={() => {}} onClose={() => {}} />);
    expect(container.querySelector('video[src="/api/media/v/file"]')).not.toBeNull();
  });
});

describe('6.6 SeriesReader: flipping', () => {
  it('moves with Previous and Next and stops at the ends', async () => {
    setup();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('img', { name: 'Photo b' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('moves with the arrow keys and does not go past the ends', async () => {
    setup();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('closes with Escape and stops listening after unmount', async () => {
    const onClose = vi.fn();
    const { unmount } = render(<SeriesReader series={series} photos={photos} onMove={() => {}} onSetCover={() => {}} onRemove={() => {}} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('6.6 SeriesReader: changing the series', () => {
  it('moves a photo and follows it', async () => {
    const { onMove } = setup({ startIndex: 1 });
    await userEvent.click(screen.getByRole('button', { name: 'Move later' }));
    expect(onMove).toHaveBeenCalledWith('b', 1);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Move earlier' }));
    expect(onMove).toHaveBeenLastCalledWith('c', -1);
  });

  it('disables moving past the ends', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Move earlier' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move later' })).toBeEnabled();
  });

  it('shows "Is the cover" for the cover photo and lets another photo become the cover', async () => {
    const { onSetCover } = setup();
    expect(screen.getByRole('button', { name: 'Is the cover' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Set as cover' }));
    expect(onSetCover).toHaveBeenCalledWith('b');
  });

  it('removes the photo on screen and closes with the button', async () => {
    const { onRemove, onClose } = setup({ startIndex: 2 });
    await userEvent.click(screen.getByRole('button', { name: 'Remove from series' }));
    expect(onRemove).toHaveBeenCalledWith('c');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('copes with the parent sending a shorter list after a removal', () => {
    const noop = () => {};
    const { rerender } = render(<SeriesReader series={series} photos={photos} startIndex={2} onMove={noop} onSetCover={noop} onRemove={noop} onClose={noop} />);
    rerender(<SeriesReader series={series} photos={photos.slice(0, 2)} startIndex={2} onMove={noop} onSetCover={noop} onRemove={noop} onClose={noop} />);
    expect(screen.getByRole('img', { name: 'Photo b' })).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('says so when the series is empty', () => {
    render(<SeriesReader series={series} photos={[]} onMove={() => {}} onSetCover={() => {}} onRemove={() => {}} onClose={() => {}} />);
    expect(screen.getByText('No photos in this series.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
