## Hint 1
`switch (action.type) { case 'rename': return { ...state, name: action.name }; ... }`. Inside each `case`, TypeScript knows which fields `action` has.

## Hint 2
For the row-level actions write one helper: `changeRow(state, rowId, change)` that returns `state` itself if the row does not exist, otherwise maps the rows, spreading `change` into the matching one.

## Hint 3
```ts
default: {
  const unreachable: never = action;
  return unreachable;
}
```
