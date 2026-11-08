// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StitchPicker } from '@/client/components/StitchPicker';
import { STITCHES } from '@/shared/stitches';

describe('3.1 StitchPicker', () => {
  it('has one group per category', () => {
    render(<StitchPicker selected="sc" onSelect={() => {}} />);
    for (const name of ['Basic', 'Shaping', 'Texture']) expect(screen.getByRole('group', { name })).toBeInTheDocument();
  });

  it('shows a button for every stitch inside its category', () => {
    render(<StitchPicker selected="sc" onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(STITCHES.length);
    const basic = screen.getByRole('group', { name: 'Basic' });
    expect(within(basic).getByRole('button', { name: 'Single crochet' })).toBeInTheDocument();
    const texture = screen.getByRole('group', { name: 'Texture' });
    expect(within(texture).getByRole('button', { name: 'Bobble' })).toBeInTheDocument();
    expect(within(texture).queryByRole('button', { name: 'Single crochet' })).toBeNull();
  });

  it('shows the abbreviation as visible text', () => {
    render(<StitchPicker selected="sc" onSelect={() => {}} />);
    expect(within(screen.getByRole('button', { name: 'Slip stitch' })).getByText('sl st')).toBeInTheDocument();
  });

  it('marks only the selected stitch as pressed', () => {
    render(<StitchPicker selected="dc" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Double crochet' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Single crochet' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  });

  it('calls onSelect with the stitch id on click', async () => {
    const onSelect = vi.fn();
    render(<StitchPicker selected="sc" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Half double crochet' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('hdc');
  });

  it('uses UK names and abbreviations when uk is set', async () => {
    const onSelect = vi.fn();
    render(<StitchPicker selected="sc" onSelect={onSelect} uk />);
    const treble = screen.getByRole('button', { name: 'Treble' }); // this is the stitch whose id is dc
    expect(within(treble).getByText('tr')).toBeInTheDocument();
    await userEvent.click(treble);
    expect(onSelect).toHaveBeenCalledWith('dc');
    expect(screen.queryByRole('button', { name: 'Single crochet' })).toBeNull();
  });
});
