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
  // TODO: Controlled inputs: one useState per field. Use useId (or fixed ids) so each <label
  //       htmlFor> matches its input. Convert the number fields with Number() only when they are
  //       not empty. Read the select value through isCategoryId so no `as` cast is needed.
  throw new Error('Not implemented yet');
}
