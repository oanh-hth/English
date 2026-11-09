# Part 3: Reading bills

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** Turn the text of a bill into items: supermarket receipts, Shopee orders and café tables.

People do not want to type every item. In this part you teach the app to read three kinds of bill from their plain text: a supermarket receipt, a Shopee order and a café table. Along the way: parsing numbers as Vietnamese bills print them, and writing parsers that are easy to test.

## a) Reading money

`72.000` is seventy-two thousand but `12,5` is twelve and a half, and `35,000` (English style) is thirty-five thousand. You cannot just remove the separators: decide from the **shape** of the text. A dot followed by exactly three digits, repeated, is a thousands separator; a comma followed by one or two digits at the end is a decimal comma.

## b) Parsing is a state machine

A Shopee order is three kinds of line (name, `variation xN`, prices) that only make sense together. Walk the lines once, remember the *previous* line, and decide what each new line means. Check the most specific pattern first; the generic fallback ("this might be a product name") goes last.

Parsing numbers: `72.000` (dot = thousands) and `12,5` (comma = decimal) are valid in the same bill. Look at the shape of the text, not just the characters.

## c) Dependency injection for tests

`parseShopee(text, today, guess = guessCategory)`: the category guesser is a **parameter with a default**. Production code calls `parseShopee(text, today)`. Tests pass `fakeGuess`, so a bug in `guessCategory` cannot make a Shopee test fail. Each exercise can fail on its own.

## Exercises 3.1-3.5

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 3.1 Reading money

`72.000` is seventy-two thousand, `12,5` is twelve and a half. Two tiny parsers with big consequences.

* **Practice:** Parse numbers as printed on Vietnamese bills
* **Edit:** `src/domain/money.ts`
* **Tests:** `tests/part3/money.test.ts`
* **Run:** `npm run check 3.1`

<details><summary>Hints</summary>

1. Test the dot-thousands pattern first.
2. `parseInt(x, 10) || 0` turns NaN into 0.

</details>

### 3.2 Supermarket receipt parser

One product per line, price at the end. Skip totals and taxes (in English and Vietnamese) without skipping real products.

* **Practice:** Line-by-line parsing
* **Edit:** `src/domain/receipt.ts`
* **Tests:** `tests/part3/receipt.test.ts`
* **Run:** `npm run check 3.2`

<details><summary>Hints</summary>

1. Slice the price off the end first, then look for the quantity in what is left.
2. Dates set `bought` for all rows, so collect it while looping and apply it at the end.

</details>

### 3.3 Online order parser (Shopee)

A product spans three lines; a 'Thành tiền' line closes a group and spreads the real total across it.

* **Practice:** State machines over lines
* **Edit:** `src/domain/shopee.ts`
* **Tests:** `tests/part3/shopee.test.ts`
* **Run:** `npm run check 3.3`

<details><summary>Hints</summary>

1. Keep three variables: the previous line, the current product and the products waiting for a total.
2. Check for a price line before the generic 'remember this as the product name' fallback.

</details>

### 3.4 Café receipt parser

Parse a table, attach free toppings to the line above and scale prices to the grand total.

* **Practice:** Regex with optional groups
* **Edit:** `src/domain/dineIn.ts`
* **Tests:** `tests/part3/dineIn.test.ts`
* **Run:** `npm run check 3.4`

<details><summary>Hints</summary>

1. Name the capture groups in comments before writing the regex.
2. Rounding: `Math.round(grand * price / sum)`.

</details>

### 3.5 Pick the right parser

Detect the bill format and call the right parser. Order matters because a café bill also contains 'Thành tiền'.

* **Practice:** Dispatching on a union type
* **Edit:** `src/domain/bills.ts`
* **Tests:** `tests/part3/bills.test.ts`
* **Run:** `npm run check 3.5`

<details><summary>Hints</summary>

1. A `switch` over a union lets TypeScript prove you covered every case.

</details>

## What your app can do now

You can import real bills from the terminal.

```bash
npm run room -- bill samples/shopee.txt --add
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **3.m1** I ran the milestone command on all three files in samples/
- **3.m2** I can pass a function as a parameter to make code testable (`guess`)
- **3.m3** I can explain why `72.000` and `12,5` need different handling
