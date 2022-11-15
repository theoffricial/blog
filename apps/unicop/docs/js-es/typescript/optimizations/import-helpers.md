---
# slug: import-helpers-with-tslib
title: TypeScript - Optimizations - Import Helpers 🧿
pagination_prev: js-es/typescript/optimizations/intro
pagination_next: null
last_update:
  date: 03/09/2022
  author: Ofri Peretz
authors: [unicop]
tags: [TypeScript, Optimization, Unknown, Advance]
---

TypeScript takes source-code and emits it into output files that are executable in a JavaScript environment, so as the output will be mor efficient, it should be running faster.

In this article, I will focus on the output files of the [tsc](../foundations/ts-compiler.md), show and explain to you how to help [tsc](../foundations/ts-compiler.md) to generate more efficient code, using an option call [importHelpers](https://www.typescriptlang.org/tsconfig#importHelpers) and a library call [tslib](https://www.npmjs.com/package/tslib).

<details>
    <summary>TL;DR ⚡️</summary>
    1. Add to your <code>tsconifg.json</code> <code>compilerOptions.importHelpers</code> to <code>true</code>.

<br/>
    2. Install <code>tslib</code> as <code>dependency</code> for applications, and as <code>peerDependency</code> + <code>devDependency</code> for libraries.

</details>

<!-- When working with TypeScript, we should always be familiar that the code we write during development is not the same code our clients use at runtime.
Due to this fact, 2 main concerns should consistently bother us: <br/>

1. The output works as expected <br/>
2. The output efficiency <br/> -->
<!--
This page shows how to optimize helper functions that TypeScript uses under-the-hood to compatible some of the common features TypeScript supports at runtime. -->

---

## The Issue 🦚

For compatibility with some of JavaScript features, TypeScript generates helper functions, in the output files.

The weird default behavior is that `tsc` adds helper functions everywhere they needed, that creates a huge code duplication, because each module has helper functions implementation.

Let's look at thus example project, to understand the issue better.

First let's examine how TypeScript [emit](../foundations/emit.md)s the following code:

`export * from 'my-module'`, which often use in source-code.

Let's take for instance this source file:

```ts reference title="src/math/index.ts"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/src/math/index.ts
```

And here is the output code:

```js reference title="dist/no-import-helpers-out-tsc/math/index.js"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/false-import-helpers-out-tsc/math/index.js#L1-L18

```

For the "star-import" feature, TypeScript has to turn 1 line-of-code to 17.

Another example for `async await` feature.

source-code:

```ts reference title="src/index.ts"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/src/index.ts#L6-L20
```

output:

```js reference title="dist/no-import-helpers-out-tsc/math/index.js"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/false-import-helpers-out-tsc/index.js#L1-L80

```

So as you can see, TypeScript has generated `__exportStar`, `__createBinding`, and `__awaiter` helper functions.
It does it in every file it [emit](../foundations/emit.md)s that using `async await`.

:::note
TypeScript currently has [24 different helper functions](https://github.com/microsoft/tslib/blob/main/tslib.js#L16-L41)
:::

## Changing The Weird Behavior 🛠

The TypeScript team realized this overhead and released a an option to change it.

- They created a package call `tslib` that exports all TypeScript helper functions

- Support a new [importHelpers](https://www.typescriptlang.org/tsconfig#importHelpers) option, that tells TypeScript to import helper functions from `tslib`, and not generating them.

Let's see the output of the same files from the previous example, but now TypeScript will use [tslib](https://www.npmjs.com/package/tslib), and enable the [importHelpers](https://www.typescriptlang.org/tsconfig#importHelpers) option.

```json reference title="tsconfig.json when 'importHelpers' is set to 'true'"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/tsconfig.true-import-helpers.json#L1-L17

```

```ts reference title="src/math/index.ts - source"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/src/math/index.ts
```

```js reference title="dist/math/index.js - transpiled using tslib (previously was 17 lines see above 👆)"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/true-import-helpers-out-tsc/math/index.js#L1-L5
```

```ts reference title="src/index.ts - source"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/src/index.ts#L4-L30
```

And that's the transpiled module when using tslib, which turned to 16 lines Vs. [+50 lines](#the-issue-)

```js reference title="dist/index.js"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/true-import-helpers-out-tsc/index.js#L7-L30
```

## What you should do 💎

### 1. Set the `importHelpers` option in your `tsconfig.json`

```json title="YOUR tsconfig.json"
{
  // your tsconfig.json
  "compilerOptions": {
    "importHelpers": true
    // ...more options
  }
  // ...more options
}
```

### 2. Install `tslib`

For applications save `tslib` as `dependency`

```bash
npm install tslib
```

For libraries save `tslib` as both `peerDependency`, and `devDependency`

```bash
npm install -D tslib
```

#### For Applications

```json
// package.json
{
    "dependecies": {
        "tslib": "x.x.x",
        ...
    },

}
```

#### For Libraries

```json
{
  "peerDependencies": {
    // As peer dependencies to ensure consumers install it
    "tslib": "x.x.x"
    // ...
  },
  "devDependencies": {
    "tslib": "x.x.x"
    // ...
  }
}
```

## Quote 🦜

> For optimized bundles with TypeScript, <br/>
> You should absolutely consider using `tslib` and `--importHelpers`.
>
> <b><cite><a href="https://github.com/Microsoft/tslib#tslib">The TypeScript Team - From tslib README file</a></cite></b>

## See more

### Articles

### TS Glossary

### JS eco-system Glossary
