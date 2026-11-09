// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { Mascots } from '@/client/Mascots';
import { item, TODAY } from '../helpers';

describe('Mascots', () => {
  it('shows Miso with her mood and line', () => {
    render(<Mascots items={[item({ exp: '2026-11-01' })]} today={TODAY} />);
    const miso = screen.getByRole('article', { name: 'Miso' });
    expect(miso).toHaveAttribute('data-mood', 'worried');
    expect(miso).toHaveTextContent('1 item expired. Please check the room.');
    expect(screen.getByRole('region', { name: 'Pets' })).toBeInTheDocument();
  });

  it('shows Misu too when something is dormant', () => {
    render(<Mascots items={[item({ name: 'Pasta', bought: '2026-08-29' })]} today={TODAY} />);
    expect(screen.getByRole('article', { name: 'Misu' })).toHaveTextContent('Have you used "Pasta" yet? It has been 71 days.');
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('shows only Miso otherwise', () => {
    render(<Mascots items={[]} today={TODAY} />);
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('article', { name: 'Miso' })).toHaveAttribute('data-mood', 'sleepy');
  });
});
