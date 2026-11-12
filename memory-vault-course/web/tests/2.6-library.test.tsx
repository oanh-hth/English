import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Library as LibraryData, MediaItem, Series } from '@memory-vault/shared';
import { describe, expect, it, vi } from 'vitest';
import { Library } from '../src/components/Library';

let n = 0;
const item = (o: Partial<MediaItem> = {}): MediaItem => {
  n += 1;
  return { id: `m${n}`, kind: 'image', mime: 'image/jpeg', originalName: `IMG_${n}.jpg`, size: 1, title: '', note: '', tags: '', takenOn: '2024-01-01', seriesId: null, position: 0, createdAt: 0, ...o };
};
const series = (o: Partial<Series> = {}): Series => ({ id: `s${++n}`, title: 'Trip', note: '', tags: '', takenOn: '2023-11-02', coverId: null, createdAt: 0, ...o });

const library: LibraryData = {
  series: [series({ id: 'S1', title: 'Hanoi trip', coverId: 'p2' })],
  media: [
    item({ id: 'beach', title: 'Beach day', takenOn: '2024-07-04', note: 'Swam!' }),
    item({ id: 'clip', kind: 'video', mime: 'video/mp4', title: 'Birthday dinner', takenOn: '2024-02-14' }),
    item({ id: 'snow', title: '', originalName: 'IMG_6602.png', takenOn: '2022-12-18' }),
    item({ id: 'p1', seriesId: 'S1', position: 0, title: 'Egg coffee' }),
    item({ id: 'p2', seriesId: 'S1', position: 1, title: 'Old quarter' }),
    item({ id: 'p3', seriesId: 'S1', position: 2, title: 'Night market' }),
  ],
};
const noop = () => {};

describe('2.6 Library', () => {
  it('says "Nothing here yet" for an empty library', () => {
    render(<Library library={{ media: [], series: [] }} onOpenItem={noop} onOpenSeries={noop} />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('groups by year, newest first', () => {
    render(<Library library={library} onOpenItem={noop} onOpenSeries={noop} />);
    const years = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(years).toEqual(['2024', '2023', '2022']);
    const y2024 = screen.getByRole('region', { name: '2024' });
    expect(within(y2024).getByRole('button', { name: /Beach day/ })).toBeInTheDocument();
    expect(within(y2024).getByRole('button', { name: /Birthday dinner/ })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: '2023' })).getByRole('button', { name: /Hanoi trip/ })).toBeInTheDocument();
  });

  it('shows the formatted date and falls back to the file name', () => {
    render(<Library library={library} onOpenItem={noop} onOpenSeries={noop} />);
    expect(screen.getByRole('button', { name: /Beach day.*Jul 4, 2024/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /IMG_6602\.png.*Dec 18, 2022/ })).toBeInTheDocument();
  });

  it('shows a series as ONE tile with its count, not its photos', () => {
    render(<Library library={library} onOpenItem={noop} onOpenSeries={noop} />);
    const tile = screen.getByRole('button', { name: /Hanoi trip/ });
    expect(tile).toHaveTextContent('3 items');
    expect(tile).toHaveTextContent('Series · Nov 2, 2023');
    expect(screen.queryByText('Egg coffee')).not.toBeInTheDocument();
    expect(screen.queryByText('Old quarter')).not.toBeInTheDocument();
  });

  it('uses the cover photo for a series and the file for an item', () => {
    const { container } = render(<Library library={library} onOpenItem={noop} onOpenSeries={noop} />);
    const tile = screen.getByRole('button', { name: /Hanoi trip/ });
    expect(tile.querySelector('img')).toHaveAttribute('src', '/api/media/p2/file');
    expect(container.querySelector('img[src="/api/media/beach/file"]')).not.toBeNull();
    expect(container.querySelector('video[src="/api/media/clip/file"]')).not.toBeNull();
  });

  it('marks items that have a note', () => {
    render(<Library library={library} onOpenItem={noop} onOpenSeries={noop} />);
    expect(within(screen.getByRole('button', { name: /Beach day/ })).getByTitle('Has a note')).toBeInTheDocument();
    expect(within(screen.getByRole('button', { name: /Birthday dinner/ })).queryByTitle('Has a note')).not.toBeInTheDocument();
  });

  it('calls the right callback when a tile is clicked', async () => {
    const onOpenItem = vi.fn();
    const onOpenSeries = vi.fn();
    render(<Library library={library} onOpenItem={onOpenItem} onOpenSeries={onOpenSeries} />);
    await userEvent.click(screen.getByRole('button', { name: /Beach day/ }));
    expect(onOpenItem).toHaveBeenCalledWith('beach');
    await userEvent.click(screen.getByRole('button', { name: /Hanoi trip/ }));
    expect(onOpenSeries).toHaveBeenCalledWith('S1');
  });

  it('filters while typing in the search box, including text inside a series', async () => {
    render(<Library library={library} onOpenItem={noop} onOpenSeries={noop} />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'egg');
    expect(screen.getByRole('button', { name: /Hanoi trip/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Beach day/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '2024' })).not.toBeInTheDocument();
  });

  it('says "No matches" when nothing fits', async () => {
    render(<Library library={library} onOpenItem={noop} onOpenSeries={noop} />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'zzzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('filters by type', async () => {
    render(<Library library={library} onOpenItem={noop} onOpenSeries={noop} />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Filter by type' }), 'video');
    expect(screen.getByRole('button', { name: /Birthday dinner/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Beach day/ })).not.toBeInTheDocument();
  });

  it('shows user text as plain text, never as HTML', () => {
    const evil = '<img src=x onerror=alert(1)>';
    const lib: LibraryData = { series: [], media: [item({ id: 'e', title: evil })] };
    const { container } = render(<Library library={lib} onOpenItem={noop} onOpenSeries={noop} />);
    expect(screen.getByText(evil)).toBeInTheDocument();
    expect(container.querySelector('img[src="x"]')).toBeNull();
  });
});
