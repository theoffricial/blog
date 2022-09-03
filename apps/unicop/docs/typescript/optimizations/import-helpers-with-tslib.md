---
slug: import-helpers-with-tslib
title: TypeScript - Optimizations - Import Helpers 🧿
pagination_prev: typescript/optimizations/index
pagination_next: null
last_update:
  date: 03/09/2022
  author: Ofri Peretz
authors: [unicop]
tags: [TypeScript, Optimization, Unknown, Advance]
---

<details>
    <summary>TL;DR ⚡️</summary>
    
    1. Add to your <code>tsconifg.json</code> <code>compilerOptions.importHelpers</code> to <code>true</code>.

<br/>
    2. Install <code>tslib</code> as <code>dependency</code> for applications, and as <code>peerDependency</code> + <code>devDependency</code> for libraries.

</details>

When working with TypeScript, we should always be familiar that the code we write during development is not the same code our clients use at runtime.
Due to this fact, 2 main concerns should consistently bother us: <br/>

1. The output works as expected <br/>
2. The output efficiency <br/>

This page shows how to optimize helper functions that TypeScript uses under-the-hood to compatible some of the common features TypeScript supports at runtime.

---

## Why 💡 - why does it important?

Optimize the runtime output, simply just make it smaller.

<!--truncate-->

## How 🤯 - how does it affect my work?

Add `tslib` as a dependency and maintain it, like any other dependency you use.

<!-- It won't. besides install `tslib` as a dependency and configure your `tsconfig.json` to use it. -->

## What 🤔 - what should I change?

Nothing.

---

## The Issue 🦚 - The root-cause a solution is necessary

As a fact, TypeScript uses internal helper functions to compatible the source-code to work at runtime.
By default, TypeScript adds these functions to each module that uses a feature that required TypeScript to use one of these functions, but TypeScript does it by duplicate the helper functions for each modules.

I created an example project, in which I show how TypeScript transpiles code:
`export * from 'my-module'`, which is used very often.

Let's take for instance this source file:

```ts reference title="src/math/index.ts"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/src/math/index.ts
```

This is how TypeScript transpiles this code:

```js reference title="dist/no-import-helpers-out-tsc/math/index.js"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/false-import-helpers-out-tsc/math/index.js#L1-L18

```

For this feature, TypeScript turned 1 line-of-code to 17.
Which is just one example of this problematic behavior,

Now see how TypeScript handles multiple syntax such as: `async await`, `export * from 'myModule'`.

So this is the source file of the root index.ts file of my example project.

```ts reference title="src/index.ts"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/src/index.ts#L6-L20
```

And here it's transpilation result:

```js reference title="dist/no-import-helpers-out-tsc/math/index.js"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/false-import-helpers-out-tsc/index.js#L1-L80

```

This compilation is the same build that created the previous `math.ts` dist-file, so now you can also understand that TypeScript duplicated both the `__exportStar` and `__createBinding` helper functions.

And it does it for every helper function, and for every module.

For instance see how long is the `__awaiter` helper function, and think that TypeScript will print it for every module that uses `async-await`.

:::note
TypeScript currently has [24 different helper functions](<(https://github.com/microsoft/tslib/blob/main/tslib.js#L16-L41)>)
:::

## The Solution 🛠

The TypeScript team realized this overhead and released a library call `tslib` which exports all TypeScript helper functions, but also created a flag, which is a `boolean` and call `importHelpers`, for the `tsconfig.json` (The TypeScript configuration file for your project) to let TypeScript know if to use `tslib` or generate it for each module.

What `importHelpers` flag does is very simple, when it is set to `true` TypeScript transpile the source modules like before, BUT whenever TypeScript detects that an helper function is required, instead of generating it, TypeScript imports it from `tslib` and avoids the generated duplications!

Now let's see how TypeScript transpile the same files, but now TypeScript will use `tslib`, and `importHelpers` set to `true`

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

## References 🔗

- **[tslib Repository](https://github.com/Microsoft/tslib#tslib)**
- **[importHelpers - TypeScript Docs](https://www.typescriptlang.org/tsconfig#importHelpers)**
- **[tslib vs. typescript NPM Trends](https://npmtrends.com/tslib-vs-typescript)**
