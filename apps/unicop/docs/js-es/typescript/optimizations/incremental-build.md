---
pagination_prev: js-es/typescript/optimizations/intro
pagination_next: null
last_update:
  date: 03/11/2022
  author: Ofri Peretz
authors: [unicop]
tags: [typescript, optimization, build, everything]
---

# Incremental Build 🧱

Incremental build allows [tsc](../foundations/ts-compiler.md) to leverage the result of previous build to build faster next time.
It does it by saving information regarding the dependencies within your ts-project, and according to changes understand what modules might affected from changes and re-build those modules only.

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

### Prerequisite Terms 🔓:

For this article to fully connecting the dots, you should first master:

- [Definition of Incremental Build](../../foundations/incremental-build.md)
- [Definition of Naive Build](../../foundations/naive-build.md)

<!-- truncate -->

### Technical Prerequisite 🔓

- TypeScript 3.4 or above.

The `incremental` option tells TypeScript to save information about the project graph from the last compilation to files stored on disk. This creates a series of `.tsbuildinfo` files in the same folder as your compilation output. They are not used by your JavaScript at runtime and can be safely deleted. You can read more about the flag in the [3.4 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#faster-subsequent-builds-with-the---incremental-flag).

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "outDir": "./lib"
  },
  "include": ["./src"]
}
```

By default with these settings, when we run tsc, TypeScript will look for a file called `.tsbuildinfo` in the output directory (`./lib`). If `./lib/.tsbuildinfo` doesn’t exist, it’ll be generated. But if it does, [tsc](../foundations/ts-compiler.md) will try to use that file to incrementally `type-check` and update our output files (emit).

These `.tsbuildinfo` files can be safely deleted and don’t have any impact on our code at runtime - they’re purely used to make compilations faster. We can also name them anything that we want, and place them anywhere we want using the `tsBuildInfoFile` option.

```json
// front-end.tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./my/custom/path",
    "outDir": "./lib"
  },
  "include": ["./src"]
}
```

<!-- ## The Solution 🛠 - Your implementation guide

Set TypeScript to work with incremental build tells TypeScript to change its default behavior and save information about last compilation.

Then on the next time TypeScript compiler is being invoked, it will use that information to detect the least costly way to `type-check` and `emit` <sub><sup>[2]</sup></sub> changes to your project.

<sub><sup>[2] - TypeScript in comparison to other transpilers (e.g. <a href="https://babeljs.io/">Babel</a>) which only emit project, also type-check the project.</sup></sub> -->

## Quote 🦜

> The `--incremental` flag allows TypeScript to save state from the last compilation to a `.tsbuildinfo` file. This file is used to figure out the smallest set of files that might to be re-checked/re-emitted since it last ran.
>
> **_[TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit)_**

## See also

### TypeScript

- [Project References](./project-references-explained/intro.md)

### Fundamentals Glossary

- [Definition of Incremental Build](../../foundations/incremental-build.md)
- [Definition of Naive Build](../../foundations/naive-build.md)

[ts-perf-wiki-incremental-projects]: https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit
[ts-3.4-release-note-link]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
