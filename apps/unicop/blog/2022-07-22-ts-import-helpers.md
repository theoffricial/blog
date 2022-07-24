---
slug: tslib
title: tslib - Optimize your TypeScript project's output 🧿
authors: [unicop, neri]
tags: [TypeScript, Optimize, Unknown]
---

<details>
    <summary>TL;DR ⚡️</summary>
    
    1. Add to your <code>tsconifg.json</code> <code>compilerOptions.importHelpers</code> to <code>true</code>.

<br/>
2. Install <code>tslib</code> as <code>dependency</code> for applications, and as <code>peerDependency</code> + <code>devDependency</code> for libraries.

</details>

## Why 💡

What `tsc` (TypeScript-compiler) does is to take each `.ts` file (= module) and transpile it to a generated form `.js` file (output module).

## How 🤯

TypeScript transpile each module separately, and it needs to generate a module that is compatible to the defined `target` for each source module.

## What 🤔

To do it, TypeScript uses a set of pre-defined helper functions, and these functions are large and duplicated.

---

## The issue 🦚

Let's demonstrate the issue

Our example is how TypeScript transpile the `export * from 'my-module'` syntax,

here is a source file I created for this article, imagine we want to define the module `math` that has different mathematical methods, and we want to export everything from the `index` file to manage and prettify imports.

```ts reference title="src/math/index.ts"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/src/math/index.ts
```

Now see how TypeScript handles its transpilation

```js reference title="dist/no-import-helpers-out-tsc/math/index.js"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/false-import-helpers-out-tsc/math/index.js#L1-L18

```

As you can see, TypeScript just turned 1 line into 17 lines, but this isn't the issue,
I also transpiled the main `index` file of this library which simply just exports `math` module

**here is the source file**

```ts reference title="src/index.ts"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/src/index.ts#L6-L20
```

**and its output - just see how long it is...**

```js reference title="dist/no-import-helpers-out-tsc/math/index.js"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/false-import-helpers-out-tsc/index.js#L1-L80

```

TypeScript just duplicated `__exportStar` and `__createBinding` once again?! YES!

Also I created a closure to demonstrate how large the implementation of TypeScript for the `__awaiter` helper function, just for fun 😉.

:::note
Currently TypeScript has **24 different helper functions**, which you can see their **implementation of 324 lines** _[here](https://github.com/microsoft/tslib/blob/main/tslib.js#L16-L41)_.
:::

## The Solution 🛠

The TypeScript team realized this overhead and released a library call `tslib` which exports all TypeScript helper functions, but also created a flag, which is a `boolean` and call `importHelpers`, for the `tsconfig.json` (The TypeScript configuration file for your project) to let TypeScript know if to use `tslib` or generate it for each module.

What `importHelpers` flag does is very simple, when it is set to `true` TypeScript transpile the source modules like before, BUT whenever TypeScript detect an helper function is required it is importing it from `tslib`!

Now let's see what happens when to the same files from the example above, using both `tslib` and `importHelpers` (`true`)

```json reference title="tsconfig.json when 'importHelpers' is 'true'"
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

```js reference title="dist/index.js - transpiled with tslib to 16 lines, (previously was more than 50 lines see above 👆)"
https://github.com/unicop-art/typescript-import-helpers-example/blob/main/dist/true-import-helpers-out-tsc/index.js#L7-L30
```

## What you should do 💎

1. Set on your tsconfig.json the `compileOptions.importHelpers` to `true`

```json title="YOUR tsconfig.json"
{
    // your tsconfig.json
    ...,
    "compilerOptions": {
        ...,
        "importHelpers": true,
        ...
    }
}
```

2. Install `tslib`

For applications save `tslib` as `dependency`

```bash
npm install -D tslib
```

For libraries save `tslib` as both `peerDependency`, and `devDependency`

```bash
npm install tslib
```

```json
// package.json
{
    // for applications
    "dependecies": {
        "tslib": "x.x.x",
        ...
    },
    // OR !
    ...,
    // for libraries
    "peerDependencies": {
        // As peer dependencies to ensure consumers install it
        "tslib": "x.x.x",
        ...
    },
    "devDependencies": {
        "tslib": "x.x.x",
        ...
    }
}
```

## Recommendations 🙌

<!-- - The TypeScript team is recommending it on the `tslib` readme, and I will quote -->

> For optimized bundles with TypeScript,
>
> you should absolutely consider using `tslib` and `--importHelpers`.
>
> — [TypeScript Team](https://github.com/Microsoft/tslib#tslib)

<br/>
I Hope you've enjoyed the reading 🙏❤️

## Sources 🔗

- **[tslib repository](https://github.com/Microsoft/tslib#tslib)**
- **[importHelpers official TypeScript Docs](https://www.typescriptlang.org/tsconfig#importHelpers)**
- **[tslib vs. typescript NPM Trends](https://npmtrends.com/tslib-vs-typescript)**
