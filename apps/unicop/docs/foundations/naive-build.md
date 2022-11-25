---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_updated:
  date: 11/25/2022
  author: Ofri Peretz
---

# Naive Build 🏷

Naive Build is when a project build command is "just" building the project without saving information that can assist building the project faster on the next time running the build command.

When no information is being stored, the next build run would have to build the entire project from scratch once again.

Today, most modern build tools, e.g. [transpilers](./transpiler.md), [compilers](./compiler.md), [modules bundlers](../js-es/foundations/modules/modules-bundler.md), etc. are not naive by default, or support advance options to enable [Incremental Build](./incremental-build.md).

## See also

### Software Foundations 🏗️

- [Build 🏷️](./build.md)
- [Compiler 🏷️](./compiler.md)

- [Incremental Build 🏷️](./incremental-build.md)
- [Transpiler](./transpiler.md)

### JS ecosystem > Foundations 🏗️

- [JavaScript Module Systems Summary 🫀](../js-es/foundations/modules/summary.md)
- [Modules Bundler 🏷️](../js-es/foundations/modules/modules-bundler.md)

### JS ecosystem > TypeScript 🔵

- [Incremental Build 🧱](../js-es/typescript/optimizations/incremental-build.md)
