import { useState, type FormEvent, type ReactElement } from 'react';
import { CATEGORIES, isCategoryId, type CategoryId, type NewItemInput } from '../domain/types';

interface Props {
  onSubmit: (input: NewItemInput) => void | Promise<void>;
}

/**
 * The "add an item" form. Requirements (the tests use these labels):
 *  - <label>Name</label> text input, <label>Category</label> select (options from CATEGORIES, default 'pantry'),
 *    <label>Expiry date</label> date input, <label>Price (VND)</label> number input, <label>Quantity</label> number input (default 1)
 *  - a submit button called "Add to room"
 *  - an empty (or spaces only) name shows an element with role="alert" saying "Give this item a name" and does NOT call onSubmit
 *  - on success call onSubmit with { name (trimmed), cat, exp?, price?, qty } (leave out empty optional fields),
 *    then clear the name, expiry and price fields (keep the category)
 */
export function ItemForm({ onSubmit }: Props): ReactElement {
  // @solution-start Controlled inputs: one useState per field. Use useId (or fixed ids) so each <label htmlFor> matches its input. Convert the number fields with Number() only when they are not empty. Read the select value through isCategoryId so no `as` cast is needed.
  const [name, setName] = useState('');
  const [cat, setCat] = useState<CategoryId>('pantry');
  const [exp, setExp] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give this item a name');
      return;
    }
    setError('');
    const input: NewItemInput = { name: trimmed, cat, qty: qty === '' ? 1 : Number(qty) };
    if (exp) input.exp = exp;
    if (price !== '') input.price = Number(price);
    await onSubmit(input);
    setName('');
    setExp('');
    setPrice('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="f-name">Name</label>
      <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} />

      <label htmlFor="f-cat">Category</label>
      <select
        id="f-cat"
        value={cat}
        onChange={(e) => {
          if (isCategoryId(e.target.value)) setCat(e.target.value);
        }}
      >
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label htmlFor="f-exp">Expiry date</label>
      <input id="f-exp" type="date" value={exp} onChange={(e) => setExp(e.target.value)} />

      <label htmlFor="f-price">Price (VND)</label>
      <input id="f-price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />

      <label htmlFor="f-qty">Quantity</label>
      <input id="f-qty" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />

      {error && <p role="alert">{error}</p>}
      <button type="submit">Add to room</button>
    </form>
  );
  // @solution-end
}
