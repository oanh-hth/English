## Hint 1
`private readonly charts = new Map<string, Chart>();` keyed by id. Read the options in the constructor: `this.now = options.now ?? Date.now`.

## Hint 2
Copy on the way in and out: `structuredClone(chart)`. For `create`: `{ ...structuredClone(input), id: newId(), updated: this.now() }`.

## Hint 3
`list()`: `[...this.charts.values()].sort((a, b) => b.updated - a.updated)`, then clone. A private `changed()` that calls `this.onChange?.(this.list())` keeps the three mutating methods tidy.
