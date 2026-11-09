// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemForm } from '@/client/ItemForm';

describe('ItemForm', () => {
  it('has all the fields, with the right defaults', () => {
    render(<ItemForm onSubmit={() => {}} />);
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Category')).toHaveValue('pantry');
    expect(screen.getByLabelText('Expiry date')).toHaveValue('');
    expect(screen.getByLabelText('Price (VND)')).toHaveValue(null);
    expect(screen.getByLabelText('Quantity')).toHaveValue(1);
    expect(screen.getByRole('button', { name: 'Add to room' })).toBeInTheDocument();
  });

  it('offers every category in the select', () => {
    render(<ItemForm onSubmit={() => {}} />);
    expect(screen.getByLabelText('Category').querySelectorAll('option')).toHaveLength(16);
    expect(screen.getByRole('option', { name: 'Dairy & eggs' })).toBeInTheDocument();
  });

  it('shows an alert and does not submit when the name is empty', async () => {
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Add to room' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Give this item a name');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a minimal item', async () => {
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), '  Rice ');
    await userEvent.click(screen.getByRole('button', { name: 'Add to room' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Rice', cat: 'pantry', qty: 1 });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('submits every field as the right type', async () => {
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Milk');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'dairy');
    await userEvent.type(screen.getByLabelText('Expiry date'), '2026-11-20');
    await userEvent.type(screen.getByLabelText('Price (VND)'), '35000');
    await userEvent.clear(screen.getByLabelText('Quantity'));
    await userEvent.type(screen.getByLabelText('Quantity'), '3');
    await userEvent.click(screen.getByRole('button', { name: 'Add to room' }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Milk', cat: 'dairy', exp: '2026-11-20', price: 35000, qty: 3 });
  });

  it('clears name, expiry and price after a successful submit but keeps the category', async () => {
    render(<ItemForm onSubmit={() => {}} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Milk');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'dairy');
    await userEvent.type(screen.getByLabelText('Price (VND)'), '100');
    await userEvent.click(screen.getByRole('button', { name: 'Add to room' }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Price (VND)')).toHaveValue(null);
    expect(screen.getByLabelText('Category')).toHaveValue('dairy');
  });

  it('removes the alert after a good submit', async () => {
    render(<ItemForm onSubmit={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add to room' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Name'), 'Milk');
    await userEvent.click(screen.getByRole('button', { name: 'Add to room' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
