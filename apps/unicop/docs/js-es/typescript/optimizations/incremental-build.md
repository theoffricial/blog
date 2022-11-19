---
pagination_prev: js-es/typescript/optimizations/intro
pagination_next: null
last_update:
  date: 03/11/2022
  author: Ofri Peretz
authors: [unicop]
tags: [typescript, optimization, build, sophisticated_builds]
---

# Incremental Build 🧱

In TypeScript (released in TypeScript 3.4), you can set the [TypeScript compiler](../foundations/ts-compiler.md) to work as [incremental build](../../foundations/incremental-build.md) tool.

The incremental build, in comparison to the default configuration, enables TypeScript to analyze and save static information of the project during build run, to build faster next time, information like dependencies between modules.

<!-- truncate -->

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

To allow that, TypeScript supports the new [incremental](https://www.typescriptlang.org/tsconfig#incremental) option, which telling TypeScript to save information about the project graph from the last compilation to files stored on disk, which enables by creating a series of [.tsbuildinfo](https://www.typescriptlang.org/tsconfig#tsBuildInfoFile) files in the same folder as your compilation output.

Those information files are not used by your JavaScript at runtime and can be safely deleted, they’re purely used to make compilations faster.

See an example

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

By default with these settings, when running the [TypeScript compiler](../foundations/ts-compiler.md), it looks for the `.tsbuildinfo` information files, which expect them to located at the output directory (`./lib`).

When `./lib/.tsbuildinfo` doesn’t exist, it’ll be generated. But if it does, [TypeScript compiler](../foundations/ts-compiler.md) tries to use it for incrementally [type-checking](../foundations/type-checking.md) and [emit](../foundations/emit.md) our output files.

---

The `.tsbuildinfo` file location is customable with the `tsBuildInfoFile` option.

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

## Quote 🦜

> The `--incremental` flag allows TypeScript to save state from the last compilation to a `.tsbuildinfo` file. This file is used to figure out the smallest set of files that might to be re-checked/re-emitted since it last ran.
>
> **_[TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit)_**

## See also

### Foundations 🏗️

- [Build Tool 🏷️](../../foundations/build.md#build-tools)
- [Incremental Build 🏷️](../../foundations/incremental-build.md)
- [Naive Build 🏷️](../../foundations/naive-build.md)
- [Type checking 🏷️](../../foundations/type-checking.md)
- [Naive Build 🏷️](../../foundations/naive-build.md)

### TypeScript Foundations 🔵🏗️

- [Type checking 🔵🏷️](../foundations/type-checking.md)
- [emit 🔵🏷️](../foundations/emit.md)
- [TypeScript compiler, or tsc 🔵🏷️](../foundations/ts-compiler.md)

### TypeScript Foundations 🔵

- [Project References](./project-references-explained/intro.md)

[ts-perf-wiki-incremental-projects]: https://github.com/microsoft/TypeScript/wiki/Performance#incremental-project-emit
[ts-3.4-release-note-link]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
