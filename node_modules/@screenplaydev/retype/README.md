# retype

Reified types for Typescript.

## About

Retype gives you a way declare types in a way that the typesystem can read and can also be checked at runtime. The need came from declaring API routes which we wanted to be able to parse for developer experience wins, while still being able to validate at runtime.

## Install

```
yarn add @screenplaydev/retype
```

## Usage

```typescript
import * as t from "@screenplaydev/retype";

const isBlogPost = t.shape({
  title: t.string,
  content: t.string,
  author: t.optional(
    t.shape({
      name: t.string,
      age: t.number,
    })
  ),
});

type TBlogPost = t.TypeOf<typeof isBlogPost>;

isBlogPost({
  title: "Hello world",
  content: "Lorem ipsum...",
}); // returns true

isBlogPost({
  foo: "bar",
}); // returns false
```

## API Reference

### JSON-ifiable Basics

- `t.nulltype`
- `t.number`
- `t.string`
- `t.array(t.string)`
- `t.shape({memberName: t.string})`

### JavaScript-isms

- `t.undefinedtype`
- `t.literal("FOO" as const)`
- `t.tuple([t.string, t.number])`
- `t.union(t.string, t.number)`
- `t.intersection(t.shape({name: t.string}), t.shape({age: t.number}))`

### Type relations

- `t.unionMany([t.number, t.string])`
- `t.intersectMany([t.shape({name: t.string}), t.shape({age: t.number})])`
- `t.literals(["FOO", "BAR"] as const)`

### Convenience

- `t.optional(t.string)`
- `t.nullable(t.string)`

## Extension

Adding other validators is very simple, just add a function which returns a type predicate:

```typescript
export const string = (value: unknown): value is string => {
  return typeof value === "string";
};
```

## Inspiration

Heavily inspired by [io-ts](https://github.com/gcanti/io-ts).

## License

MIT Licensed (see LICENSE.txt)

Copyright 2021, Screenplay Studios Inc.
