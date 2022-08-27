---
# slug: typescript-type-checking-faster-part-1-incremental-builds
title: TypeScript - Optimizations - Incremental Builds ⚡️
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

## Why 💡 - why does it important?

Incremental builds as a concept lets your compiler to be smarter to avoid re-build unnecessary parts, and improve its build times, improves the development feedback loop, and to have a good development experience,
which simply mean faster progression.

<!--truncate-->

## How 🤯 - how does it affect my work?

Setup incremental builds will enable `TypeScript` to save information of the previous compilation and to calculate the least-costly way to build the next one.

It does it in a generated `.tsbuildinfo` file, which doesn't affects the dist-code, and is described in details below.

Rather than that nothing.

## What 🤔 - what should I change?

Set your TypeScript configurations with the `incremental` option, which tells TypeScript to build with incremental builds.

- zero costs, and no extra effort required, except reading this article 😉
- As I mentioned the changes won't affect or change how the runtime code works.

Now let's begin!

---

## The issue 🦚 - The root-cause a solution is necessary

By default, `TypeScript` build is naive.
It means that TypeScript takes all source-files it finds <sub><sup>[1]</sup></sub> and builds dist-files out of them.
Incremental builds tells `TypeScript` to change its default behavior by save information about the project graph from the last compilation.

Then on the next time TypeScript compiler invokes, it will use that information to detect the least costly way to `type-check` and `emit` <sub><sup>[2]</sup></sub> changes to your project.

<sub><sup>[1] - TypeScript finds files based on the include, exclude or files configurations.</sup></sub>
<br/>
<sub><sup>[2] - TypeScript in comparison to other transpilers (e.g. <a href="https://babeljs.io/">Babel</a>) which only emit project, also type-check the project.</sup></sub>

## Concept 💭 - Incremental Build

Incremental build - When a compiler/transpiler program save information on previous compilation, to have a sort of understanding and detecting the least costly way to do the compilation next time.
The information usually maps the project dependencies graph and use it to re-build only parts that depend on the latest changes, which each tool implements it in its own method.

## The Solution 🛠 - Your implementation guide

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
    ...more options
  },
  "include": ["./src"]
  ...more options
}
```

The `incremental` option set to `true` enables `TypeScript` to save information from the last compilation and use this information for the next build, the information will be generated in a file called `.tsbuildinfo`.

So with these settings, when we run tsc, TypeScript will look for a file called `.tsbuildinfo` in the output directory (`./build`). If `./build/.tsbuildinfo` doesn’t exist, it’ll be generated. But if it does, tsc will try to use that file to incrementally type-check and update our output files.

### 2. [Optional] Customize `.tsbuildinfo` location with `tsBuildInfoFile` option

You can specify a custom location for the `.tsbuildinfo` with the `tsBuildInfoFile` option:

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

## Summary 💎 - Key Actions

1. Add the `incremental` option to your current `tsconfig.json`.
2. Add custom path (optional) with the `tsBuildInfoFile` option.
3. Add `.tsbuildinfo` to your SCM (e.g. `git`) ignore file (e.g. `.gitignore`).

## Quote 🦜

> The `--incremental` flag allows TypeScript to save state from the last compilation to a `.tsbuildinfo` file. This file is used to figure out the smallest set of files that might to be re-checked/re-emitted since it last ran.
>
> - **[TypeScript Team](https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit)**

## What's next ⏭

To take `incremental` builds one step forward,
read my article about `TypeScript` projects `composite`.
It is more advanced, and requires some changes of how we work with `TypeScript`, but might be worth it!

## Sources 🔗

More detailed

- [TypeScript 3.4 Release Note][ts-incremental-build] - When the `incremental` option released
- [TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit) - "Incremental Project Emit" section, explains generally how incremental builds work, I based on its answer in this article.
- [TypeScript incremental option](https://www.typescriptlang.org/tsconfig#incremental)
- [TypeScript tsBuildInfoFile option](https://www.typescriptlang.org/tsconfig#tsBuildInfoFile)

<!-- links -->

[ts-3.4-release-note-link]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
