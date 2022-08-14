---
slug: typescript-type-checking-faster-part-1-incremental-builds
title: TypeScript - Type-Checking Faster - Part 1 - Incremental Builds ⚡️
authors: [unicop]
tags: [TypeScript, Incremental Builds, Optimize, Unknown, Advanced]
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

## Intro

If you would like your `TypeScript` project to build faster, this article is for you.

<!--truncate-->

## The issue 🦚

By default, `TypeScript` build is naive.
What it does is simply to take all `src` files it finds <sub><sup>[1]</sup></sub> and builds `dist` files.
When setting incremental builds tells `TypeScript` to save information about the project graph from the last compilation.

So, The next time `TypeScript` is invoked with `incremental`, it will use that information to detect the least costly way to `type-check` and `emit` <sub><sup>[2]</sup></sub> changes to your project.

<sub><sup>[1] - TypeScript finds files based on the `include`, `exclude` or `files` configurations.</sup></sub>

<sub><sup>[2] - TypeScript in comparison to other transpilers (e.g. [Babel][babel-site]) which only `emit` project, also `type-check` the project.</sup></sub>

## Why 💡

Improving build times of your project improves its feedback loop,
which leads to faster progression.

Also, what in this article

- Has zero cost, and no extra development required (except reading this article 😉)
- The changes won't affect or change how the runtime code works

## How 🤯

Let `TypeScript` to save information of previous compilation to calculates the least-costly way to build the next one.

## What 🤔

Set `TypeScript` to use `incremental` builds.

Let's do it.

---

## The Solution 🛠

**Requirements**:

- `TypeScript 3.4` or above

### 1. Make TypeScript to Incremental Build

Add the `incremental` flag to your `tsconfig.json`

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "outDir": "./build"
    ...more options
  },
  "include": ["./src"]
  ...more options
}
```

The `incremental` option set to `true` enables `TypeScript` to save information from last compilation and use this information for the next build, the information will be generated in file call `.tsbuildinfo`.

So with these settings, when we run tsc, TypeScript will look for a file called `.tsbuildinfo` in the output directory (`./build`). If `./build/.tsbuildinfo` doesn’t exist, it’ll be generated. But if it does, tsc will try to use that file to incrementally type-check and update our output files.

### 2. [Optional] Customize `.tsbuildinfo` location with `tsBuildInfoFile` option

You can specified a custom location for the `.tsbuildinfo` with the `tsBuildInfoFile` option:

```json
{
  "compilerOptions": {
    "incremental": true,
    "outDir": "./build",
    "tsBuildInfoFile": "./my/custom/path",
    ...more options
  },
  "include": ["./src"]
  ...more options
}
```

`.tsbuildinfo` files can be safely deleted and don’t have any impact on our code at runtime - they’re purely used to make compilations faster. We can also name them anything that we want, and place them anywhere we want using the `tsBuildInfoFile` option.

## What you should do 💎

1. Add the `incremental` option to your current `tsconfig.json`.
2. Add custom path (optional) with the `tsBuildInfoFile` option.
3. Add `.tsbuildinfo` to your SCM (e.g. `git`) ignore file (e.g. `.gitignore`).

## Recommendations 🙌

> This `.tsbuildinfo` file is used to figure out the smallest set of files that might to be re-checked/re-emitted since it last ran.
>
> - **[TypeScript Team](https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit)**

## Definition

Incremental build - When a compiler/transpiler program based on previous compilation can detect the least costly way to do the compilation next time.
It does it by saving information about the project graph from the last compilation,
and uses that information to re-build only what's necessary.

## What's next 🧐

To take `incremental` builds one step forward,
read my article about `TypeScript` projects `composite`.
It is more advanced, and requires some changes of how we work with `TypeScript`, but might worth it!

## Sources 🔗

More detailed

- [TypeScript 3.4 Release Note][ts-incremental-build] - When the `incremental` option released
- [TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit) - "Incremental Project Emit" section, this page explain many ways to improve build times.

Configurations

- [TypeScript incremental option](https://www.typescriptlang.org/tsconfig#incremental)
- [TypeScript tsBuildInfoFile option](https://www.typescriptlang.org/tsconfig#tsBuildInfoFile)
