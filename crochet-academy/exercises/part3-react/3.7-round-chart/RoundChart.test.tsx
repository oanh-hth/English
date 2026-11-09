// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RoundChart } from '@/client/chart/RoundChart';
import { chart, grp, row, st } from '../../_helpers/fixtures';

const sample = chart(
  [row('a', [st('mr'), st('sc', 6)], { color: '#f2a3b8' }), row('b', [grp(2, st('dc'), st('ch'))], { color: '#c3d8b4' })],
  'round',
  'Coaster',
);

describe('3.7 RoundChart', () => {
  it('asks for a round when the chart is empty', () => {
    render(<RoundChart chart={chart([], 'round')} />);
    expect(screen.getByText('Add a round to see your chart.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('is an image named after the chart', () => {
    render(<RoundChart chart={sample} />);
    expect(screen.getByRole('img', { name: 'Chart: Coaster' })).toBeInTheDocument();
  });

  it('draws one wedge per worked stitch, but not for the magic ring', () => {
    render(<RoundChart chart={sample} />);
    expect(screen.getAllByTestId('cell')).toHaveLength(6 + 4);
  });

  it('shows the magic ring symbol in the hub only when there is one', () => {
    const { unmount } = render(<RoundChart chart={sample} />);
    expect(screen.getByTestId('hub')).toBeInTheDocument();
    expect(screen.getByTestId('magic-ring')).toBeInTheDocument();
    unmount();
    render(<RoundChart chart={chart([row('a', [st('sc', 6)])], 'round')} />);
    expect(screen.queryByTestId('magic-ring')).toBeNull();
    expect(screen.getByTestId('hub')).toBeInTheDocument();
  });

  it('names each stitch in a <title>, with UK names and loop modifiers', () => {
    render(<RoundChart chart={sample} />);
    expect(screen.getAllByText('Single crochet')).toHaveLength(6);
    expect(screen.getAllByText('Chain')).toHaveLength(2);
    const { unmount } = render(<RoundChart chart={chart([row('a', [st('dc', 1, 'FLO')])], 'round')} uk />);
    expect(screen.getByText('Treble (FLO)')).toBeInTheDocument();
    unmount();
  });

  it('draws wedges as paths in the row colour', () => {
    render(<RoundChart chart={sample} />);
    const cells = screen.getAllByTestId('cell');
    const first = cells[0].querySelector('path');
    expect(first).toHaveAttribute('fill', '#f2a3b8');
    expect(first?.getAttribute('d')).toMatch(/^M[\d.]+ [\d.]+A/);
    expect(cells[9].querySelector('path')).toHaveAttribute('fill', '#c3d8b4');
  });

  it('labels each round', () => {
    render(<RoundChart chart={sample} />);
    const labels = screen.getAllByTestId('round-label');
    expect(labels.map((l) => l.textContent)).toEqual(['1', '2']);
    expect(within(labels[0]).getByText('1')).toBeInTheDocument();
  });

  it('marks the cells of the active round', () => {
    render(<RoundChart chart={sample} activeRowId="b" />);
    const cells = screen.getAllByTestId('cell');
    expect(cells.filter((c) => c.getAttribute('data-active') === 'true')).toHaveLength(4);
    expect(cells[0]).toHaveAttribute('data-active', 'false');
  });

  it('reports which round was clicked', async () => {
    const onSelectRow = vi.fn();
    render(<RoundChart chart={sample} onSelectRow={onSelectRow} />);
    await userEvent.click(screen.getAllByTestId('cell')[0]);
    expect(onSelectRow).toHaveBeenCalledWith('a');
    await userEvent.click(screen.getAllByTestId('cell')[7]);
    expect(onSelectRow).toHaveBeenLastCalledWith('b');
  });

  it('does not crash without a click handler', async () => {
    render(<RoundChart chart={sample} />);
    await userEvent.click(screen.getAllByTestId('cell')[0]);
  });
});
