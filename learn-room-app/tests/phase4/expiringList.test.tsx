// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpiringList } from '@/client/ExpiringList';
import { item, TODAY } from '../helpers';

describe('ExpiringList', () => {
  it('shows a friendly message when nothing needs attention', () => {
    render(<ExpiringList items={[item({ exp: '2027-01-01' })]} today={TODAY} />);
    expect(screen.getByRole('region', { name: 'Needs attention' })).toBeInTheDocument();
    expect(screen.getByText('Nothing is about to expire')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('lists expired and soon items, most urgent first, with text and status', () => {
    const items = [
      item({ name: 'Milk', exp: '2026-11-09' }),
      item({ name: 'Yogurt', exp: '2026-11-05' }),
      item({ name: 'Rice', exp: '2027-06-01' }),
    ];
    render(<ExpiringList items={items} today={TODAY} />);
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Yogurt');
    expect(rows[0]).toHaveTextContent('Expired 3 days ago');
    expect(rows[0]).toHaveAttribute('data-status', 'expired');
    expect(rows[1]).toHaveTextContent('Milk');
    expect(rows[1]).toHaveTextContent('Expires tomorrow');
    expect(rows[1]).toHaveAttribute('data-status', 'soon');
  });

  it('skips used items', () => {
    render(<ExpiringList items={[item({ name: 'Old', exp: '2026-11-01', used: true })]} today={TODAY} />);
    expect(screen.getByText('Nothing is about to expire')).toBeInTheDocument();
  });

  it('has no buttons unless onUse is given', () => {
    render(<ExpiringList items={[item({ name: 'Milk', exp: '2026-11-09' })]} today={TODAY} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onUse with the item id', async () => {
    const onUse = vi.fn();
    const milk = item({ id: 'milk', name: 'Milk', exp: '2026-11-09' });
    const eggs = item({ id: 'eggs', name: 'Eggs', exp: '2026-11-08' });
    render(<ExpiringList items={[milk, eggs]} today={TODAY} onUse={onUse} />);
    await userEvent.click(within(screen.getByRole('list')).getByRole('button', { name: 'Used Milk' }));
    expect(onUse).toHaveBeenCalledWith('milk');
    expect(onUse).toHaveBeenCalledTimes(1);
  });
});
