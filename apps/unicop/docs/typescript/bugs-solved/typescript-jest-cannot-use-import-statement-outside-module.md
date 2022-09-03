---
slug: typescript-jest-cannot-use-import-statement-outside-module
title: Solve ts-jest 🤡 - cannot use import statement outside module

last_update:
  date: 03/09/2022
  author: Ofri Peretz

authors: [unicop]
tags: [TypeScript, Jest, Modules, Import]
---

# TS Jest 🤡 - "Cannot use import statement outside module" Solved

## The Issue 🦚

Natively, jest works only with `CommonJS`, because it is a **[Nodejs based CLI](../glossary/js-module-systems-compatibility.md)**, it means modules are in the form of `require`, and `exports`.
However, the jest team wanted to support many different environments to make jest practical in the JS eco-system they add the support of **[code-transformation](https://jestjs.io/docs/code-transformation)**, basically it means, transform code from one form to another, most of the time the transform is about converting modules from one system to another.

The code-transformation output (or transpilation output) will be in a form jest can work with, which I already covered that is `CommonJS` module system, and the syntax of the JS language should be supported to the `Nodejs` version that runs jest.
e.g. for incompatible syntax: spread operators [...myArray], doesn't work for `node < 14.x.x`, so if you use the spread operator in your test or source files and the runtime version of node you run jest with is lower than 14.x.x, the execute will fail.

<!--truncate-->

## The solution 🛠

You should add to your `jest config` a transformer.

There are 2 recommended transpilers jest recommends

- **[babel](https://jestjs.io/docs/getting-started#using-babel)** - JavaScript Transpile, through time it add support for TypeScript and JSX, no type-checking (just ignore types syntax) and faster.
- **[ts-jest](https://kulshekhar.github.io/ts-jest/)** - runs behind the scenes TypeScript and includes type-checking, which is more solid but more expensive to run

## What you should do 💎

There are tons of practical articles "what you should do", I hope that I explained the "Why" well.

Some articles I found with a quick search

- **[Stackoverflow discussion + answer](https://stackoverflow.com/questions/58613492/how-to-resolve-cannot-use-import-statement-outside-a-module-in-jest)**
- **[typescript-jest-cannot-use-import-statement-outside-module](https://bobbyhadz.com/blog/typescript-jest-cannot-use-import-statement-outside-module)**

## Sources 🔗

- **[babel vs ts-jest](https://kulshekhar.github.io/ts-jest/docs/babel7-or-ts/)**
- **[jest using TypeScript](https://jestjs.io/docs/getting-started#using-typescript)**
