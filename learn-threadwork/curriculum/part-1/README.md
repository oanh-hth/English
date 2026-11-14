# Part 1: TypeScript and the task model

TypeScript through Threadwork's data: tasks, outcomes and the category list. Types, unions, records, immutable updates, generics and validating data from outside.

## Sections

- **[1a Types, objects and functions](a-types-and-objects.md)** · exercise 1.1
- **[1b Unions, as const and the category list](b-unions-and-records.md)** · exercise 1.2
- **[1c Changing data without mutating it](c-immutable-updates.md)** · exercise 1.3
- **[1d Generics and data from outside](d-generics-and-unknown.md)** · exercise 1.4

Read the sections in order. Each ends with its exercises; do them before moving on. `npm run progress` shows where you are.

## Knowledge check

Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can explain interfaces, union types and when TypeScript infers a type
- [ ] I can derive a type from an `as const` list and explain what `satisfies` adds
- [ ] I can explain why tasks store a category id and not its name
- [ ] I can update objects and arrays without mutating them, and return the same array when nothing changed
- [ ] I can write a generic function
- [ ] I validate outside data from `unknown` and return a `Result` instead of throwing
