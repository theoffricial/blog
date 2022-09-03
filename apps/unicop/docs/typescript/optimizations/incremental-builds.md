---
# slug: typescript-type-checking-faster-part-1-incremental-builds
title: TypeScript - Optimizations - Incremental Builds 🧱
pagination_prev: typescript/optimizations/index
pagination_next: null
last_update:
  date: 03/09/2022
  author: Ofri Peretz
authors: [unicop]
tags: [TypeScript, Optimizations, Incremental Builds, Unknown, Advanced]
---

<details>
  <summary>TL;DR ⚡️</summary>
  <br/>
  1. Add to your <code>tsconifg.json</code> the <code>incremental</code> option
  <br/>
  2. [Optional] Add custom path with the <code>tsBuildInfoFile</code> option
  <br/>
  3. Add your new <code>.tsbuildinfo</code> to your <code>SCM</code> (e.g. Git) ignore file (e.g. <code>.gitignore</code>)
<br/>
</details>

If the term "incremental build" is foreign to you, <br/>
I would recommend you to read **[Glossary - Build Incremental vs. Naive 🧠](../glossary/incremental-vs-naive-build.md)** first, <br/>
it will take you 2 minutes to read.

<!-- truncate -->

---

## Why 💡 - why does it important?

Incremental builds should reduce your build times.

<!-- Incremental builds as a concept lets your compiler to be smarter to avoid re-build unnecessary parts, and improve its build times, improves the development feedback loop, and to have a good development experience,
which simply mean faster progression. -->

<!--truncate-->

## How 🤯 - how does it affect my work?

Running `tsc` directly or under-the-hood will generate a new file `.tsbuildinfo` besides keep it during development (you can add it to your `.gitignore`), nothing change.

<!-- call During development
Setup incremental builds will enable `TypeScript` to save information of the previous compilation and to calculate the least-costly way to build the next one.

It does it in a generated `.tsbuildinfo` file, which doesn't affects the dist-code, and is described in details below.

Rather than that nothing. -->

## What 🤔 - what should I change?

1-2 options in your `tsconfig.json`.

<!-- Set your TypeScript configurations with the `incremental` option, which tells TypeScript to build with incremental builds.

- zero costs, and no extra effort required, except reading this article 😉
- As I mentioned the changes won't affect or change how the runtime code works.

Now let's begin! -->

---

## The issue 🦚 - The root-cause a solution is necessary

By default, TypeScript build is **[naive](../glossary/incremental-vs-naive-build.md)**. <br/>
It means that TypeScript takes all source-files it finds <sub><sup>[1]</sup></sub> and builds dist-files out of them.

Incremental build tells TypeScript to change its default behavior by save information about the project graph from the last compilation.

Then on the next time TypeScript compiler invokes, it will use that information to detect the least costly way to `type-check` and `emit` <sub><sup>[2]</sup></sub> changes to your project.

<sub><sup>[1] - TypeScript finds files based on the <code>include</code>, <code>exclude</code> or <code>files</code> configurations.</sup></sub>
<br/>

## The Solution 🛠 - Your implementation guide

Set TypeScript to work with incremental build tells TypeScript to change its default behavior and save information about last compilation.

Then on the next time TypeScript compiler is being invoked, it will use that information to detect the least costly way to `type-check` and `emit` <sub><sup>[2]</sup></sub> changes to your project.

<sub><sup>[2] - TypeScript in comparison to other transpilers (e.g. <a href="https://babeljs.io/">Babel</a>) which only emit project, also type-check the project.</sup></sub>

**Prerequisite**:

- `TypeScript 3.4` or above

### 1. Setup TypeScript to work with Incremental Build

Add the `incremental` flag to your `tsconfig.json`

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "outDir": "./build"
    // ...more options
  },
  "include": ["./src"]
  // ...more options
}
```

The `incremental` option set to `true` enables TypeScript to save information from the last compilation and use this information for the next build, the information will be generated in a file called `.tsbuildinfo`.

Now, the next time running `tsc`, TypeScript will for a file called `.tsbuildinfo` in the output directory (`./build`). If `./build/.tsbuildinfo` doesn’t exist, it will generate it. But if it does, `tsc` uses it to incrementally type-check and emit the output.

### About `.tsbuildinfo`

> `.tsbuildinfo` files can be safely deleted and don’t have any impact on our code at runtime - they’re purely used to make compilations faster. We can also name them anything that we want, and place them anywhere we want using the `tsBuildInfoFile` option.
>
> <b><cite><a href="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#faster-subsequent-builds-with-the---incremental-flag">From TypeScript 3.4 Release Note</a></cite></b>

### 2. [Optional] Customize `.tsbuildinfo` location with `tsBuildInfoFile` option

You can specify a custom location for the `.tsbuildinfo` with the `tsBuildInfoFile` option:

```json
{
  "compilerOptions": {
    "incremental": true,
    "outDir": "./build",
    "tsBuildInfoFile": "./my/custom/path"
    // ...more options
  },
  "include": ["./src"]
  // ...more options
}
```

## Key Notes 💎

1. Add the `incremental` option to your current `tsconfig.json`.
2. Add custom path (optional) with the `tsBuildInfoFile` option.
3. Add `.tsbuildinfo` to your SCM (e.g. `git`) ignore file (e.g. `.gitignore`).

## Quote 🦜

> The `--incremental` flag allows TypeScript to save state from the last compilation to a `.tsbuildinfo` file. This file is used to figure out the smallest set of files that might to be re-checked/re-emitted since it last ran.
>
> <b><cite><a href="https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit">From TypeScript Performance Wiki</a></cite></b>

## What's next ⏭

To take your `incremental` build two steps forward, <br/>
Read **[TypeScript - Optimizations - Project References Explained 🧬](./project-references-explained/index.md)**.

## References 🔗

- **[TypeScript - All Projects Options](https://www.typescriptlang.org/tsconfig#Projects_6255)**

<!-- links -->

[ts-perf-wiki-incremental-projects]: https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit
[ts-3.4-release-note-link]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
