// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { SpendingCard } from '@/client/SpendingCard';
import type { SpendingComparison } from '@/domain/spending';

const base: SpendingComparison = { current: 150_000, previousSameDays: 120_000, previousTotal: 400_000, changePct: 25, trend: 'up' };
const text = (el: HTMLElement) => (el.textContent ?? '').replace(/\s/g, ' ');

describe('SpendingCard', () => {
  it('shows the amounts in dong', () => {
    render(<SpendingCard spending={base} />);
    const card = screen.getByRole('region', { name: 'Spending' });
    expect(text(card)).toContain('150.000 ₫');
    expect(text(card)).toContain('Last month, same days: 120.000 ₫');
  });
  it('says Up with a rounded percentage', () => {
    render(<SpendingCard spending={{ ...base, changePct: 24.6 }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Up 25% vs last month');
    expect(screen.getByRole('region', { name: 'Spending' })).toHaveAttribute('data-trend', 'up');
  });
  it('says Down without a minus sign', () => {
    render(<SpendingCard spending={{ ...base, current: 90_000, changePct: -25, trend: 'down' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Down 25% vs last month');
    expect(screen.getByRole('region', { name: 'Spending' })).toHaveAttribute('data-trend', 'down');
  });
  it('says the same when flat', () => {
    render(<SpendingCard spending={{ ...base, changePct: 0, trend: 'flat' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Same as last month');
  });
  it('explains when there is nothing to compare with', () => {
    render(<SpendingCard spending={{ ...base, previousSameDays: 0, changePct: null }} />);
    expect(screen.getByRole('status')).toHaveTextContent('No data for last month yet');
  });
});
