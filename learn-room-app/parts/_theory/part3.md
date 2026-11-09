People do not want to type every item. In this part you teach the app to read three kinds of bill from their plain text: a supermarket receipt, a Shopee order and a café table. Along the way: parsing numbers as Vietnamese bills print them, and writing parsers that are easy to test.

## a) Reading money

`72.000` is seventy-two thousand but `12,5` is twelve and a half, and `35,000` (English style) is thirty-five thousand. You cannot just remove the separators: decide from the **shape** of the text. A dot followed by exactly three digits, repeated, is a thousands separator; a comma followed by one or two digits at the end is a decimal comma.

## b) Parsing is a state machine

A Shopee order is three kinds of line (name, `variation xN`, prices) that only make sense together. Walk the lines once, remember the *previous* line, and decide what each new line means. Check the most specific pattern first; the generic fallback ("this might be a product name") goes last.

Parsing numbers: `72.000` (dot = thousands) and `12,5` (comma = decimal) are valid in the same bill. Look at the shape of the text, not just the characters.

## c) Dependency injection for tests

`parseShopee(text, today, guess = guessCategory)`: the category guesser is a **parameter with a default**. Production code calls `parseShopee(text, today)`. Tests pass `fakeGuess`, so a bug in `guessCategory` cannot make a Shopee test fail. Each exercise can fail on its own.
