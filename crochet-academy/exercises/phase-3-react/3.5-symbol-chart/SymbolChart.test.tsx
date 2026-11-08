// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SymbolChart } from '@/client/chart/SymbolChart';
import { chart, grp, row, st } from '../../_helpers/fixtures';

const sample = chart(
  [row('a', [st('sc', 3)], { color: '#f2a3b8' }), row('b', [grp(2, st('dc'), st('ch'))], { color: '#c3d8b4' })],
  'flat',
  'Leaf',
);

describe('3.5 SymbolChart', () => {
  it('asks for a row when the chart is empty', () => {
    render(<SymbolChart chart={chart([])} />);
    expect(screen.getByText('Add a row to see your chart.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('is an image named after the chart', () => {
    render(<SymbolChart chart={sample} />);
    expect(screen.getByRole('img', { name: 'Chart: Leaf' })).toBeInTheDocument();
  });

  it('draws one cell per worked stitch', () => {
    render(<SymbolChart chart={sample} />);
    expect(screen.getAllByTestId('cell')).toHaveLength(3 + 4); // 3 sc + (dc, ch) x 2
  });

  it('names each stitch in a <title>', () => {
    render(<SymbolChart chart={sample} />);
    expect(screen.getAllByText('Single crochet')).toHaveLength(3);
    expect(screen.getAllByText('Double crochet')).toHaveLength(2);
    expect(screen.getAllByText('Chain')).toHaveLength(2);
  });

  it('uses UK names and shows the loop modifier', () => {
    render(<SymbolChart chart={chart([row('a', [st('dc', 1, 'BLO')])])} uk />);
    expect(screen.getByText('Treble (BLO)')).toBeInTheDocument();
  });

  it('colours each cell with its row colour', () => {
    render(<SymbolChart chart={sample} />);
    const first = screen.getAllByTestId('cell')[0];
    expect(first.querySelector('rect')).toHaveAttribute('fill', '#f2a3b8');
    const last = screen.getAllByTestId('cell')[6];
    expect(last.querySelector('rect')).toHaveAttribute('fill', '#c3d8b4');
  });

  it('labels the rows with their working direction', () => {
    render(<SymbolChart chart={sample} />);
    expect(screen.getByText('1 ←')).toBeInTheDocument();
    expect(screen.getByText('→ 2')).toBeInTheDocument();
  });

  it('marks the cells of the active row', () => {
    render(<SymbolChart chart={sample} activeRowId="b" />);
    const cells = screen.getAllByTestId('cell');
    expect(cells.filter((c) => c.getAttribute('data-active') === 'true')).toHaveLength(4);
    expect(cells[0]).toHaveAttribute('data-active', 'false');
  });

  it('reports which row was clicked', async () => {
    const onSelectRow = vi.fn();
    render(<SymbolChart chart={sample} onSelectRow={onSelectRow} />);
    await userEvent.click(screen.getAllByTestId('cell')[0]);
    expect(onSelectRow).toHaveBeenCalledWith('a');
    await userEvent.click(screen.getAllByTestId('cell')[5]);
    expect(onSelectRow).toHaveBeenLastCalledWith('b');
  });

  it('does not crash when no click handler is given', async () => {
    render(<SymbolChart chart={sample} />);
    await userEvent.click(screen.getAllByTestId('cell')[0]);
  });
});
