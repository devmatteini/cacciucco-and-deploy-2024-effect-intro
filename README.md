# Cacciucco & Deploy 2024 - Effect introduction

An hands-on introduction to TypeScript library [Effect](https://effect.website/).

- [Installation](#installation)
- [What is Effect](#what-is-effect)
- [Effect features](#effect-features)
- [Effect essentials](#effect-essentials)
- [Coding Kata](#coding-kata)
  - [Development](#development)
- [Effect resources](#effect-resources)

## Installation

- Node.js 20+
- npm/yarn/pnpm package manager

```shell
git clone https://github.com/devmatteini/cacciucco-and-deploy-2024-effect-intro/
pnpm install
```

## What is Effect

Effect is a TypeScript library that enables to safely build complex and composable applications.

> The missing standard library for TypeScript (https://effect.website/)

## Effect features

- Concurrency
- Composability
- Resource Safety
- Type Safety
- Error Handling
- Observability

## Effect essentials

The Effect type `Effect<Success, Error, Requirements>` is the core type of the whole ecosystem.

```ts
type Effect<Success, Error, Requirements> = (context: Context<Requirements>) => Error | Success
```

Effects are **immutable** values that **lazily** describe a workflow or operation.

In order to execute an Effect, you need the Effect runtime:

```ts
const program = Effect.sync(() => {
  console.log("Hello world!")
})

Effect.runSync(program)
// output: Hello world!
```

### Generators

You can write more readable code using JavaScript generators.

Think of `function*/yield*` as `async/await`.

```ts
import { Effect } from "effect"

declare const loadTodos: Effect<Todo[]>

const program = Effect.gen(function* () {
  const allTodos = yield* loadTodos
  const todos = allTodos.filter((x) => x.status !== "completed")
  console.log(todos)
})

Effect.runSync(program)
```

### Pipelines

Alternatively to generators you can use pipelines

```ts
import { pipe } from "effect"

const increment = (x: number) => x + 1
const double = (x: number) => x * 2

const result = pipe(5, increment, double)

console.log(result)
// output: 12
```

Some effect types also have `.pipe` method

```ts
import { Effect } from "effect"

const program = Effect.succeed(5).pipe(Effect.map(increment))

console.log(Effect.runSync(program))
// output: 6
```

## Coding Kata

The original code was created by Massimo Iacolare for [doubleloop.io](https://doubleloop.io/chi-siamo/) website and later extracted into [imperative-to-fp-kata](https://github.com/iacoware/imperative-to-fp-kata).

The application resize and compress all the images found in `src/public/team-photos` write them into `src/public/team-photos/processed` and generate a json file (`images.json`) with the list of the processed images within the same folder

The goal is to progressively introduce Effect into the codebase while keeping the application working.

Start by opening the [src/index.ts](src/index.ts) application entrypoint.

### Development

Effect documentation: https://effect.website/docs/introduction

Run the application:

```shell
pnpm start
```

Run typecheck:

```shell
pnpm typecheck
# or with watcher
pnpm typecheck:w
```

Run the tests:

```shell
pnpm test
# or with watcher
pnpm test:w
```

You start with only one end to end test that ensures that the `images.json` file is properly generated.

The testing framework is [vitest](https://vitest.dev/)

### Solution

Check out the `solution` branch, or for the full kata see https://github.com/devmatteini/imperative-to-fp-kata/tree/solution

## Effect resources

- https://effect.website
- [Effect Days - beginner workshop](https://github.com/ethanniser/effect-workshop/)
- [Effect Days - advanced workshop](https://github.com/IMax153/advanced-effect-workshop)
- [Antoine Coulon’s Effect introduction](https://github.com/antoine-coulon/effect-introduction)
- [Effect Days 2024 conference playlist](https://www.youtube.com/watch?v=Lz2J1NBnHK4&list=PLDf3uQLaK2B9a4tbMgGd9wFeEnMA50z4w)
- https://cosimomatteini.com/blog/build-applications-with-effect
