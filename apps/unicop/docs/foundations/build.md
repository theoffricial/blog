---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_updated:
  date: 11/25/2022
  author: Ofri Peretz
---

# Build 🏷️

In software development, a build is the process of converting source code files into standalone software artifact(s) that can be run on a computer.

## Build tools

The process of building a computer program is usually managed by a build tool, a program that coordinates and controls other programs.

The build utility typically needs to compile the various files, in the correct order.

If the source code in a particular file has not changed then it may not need to be recompiled ("may not" rather than "need not" because it may itself depend on other files that have changed).

Tools that use **[naive build](./naive-build.md)** compiles source code that doesn't need to recompile, while sophisticated build utilities attempt to refrain from recompiling code that does not need it, to shorten the time required to complete the build, which also known as **[incremental build](./incremental-build.md)** tools.

## See also

### Software Foundations 🏗️

- [Naive Build](./naive-build.md)
- [Incremental Build](./incremental-build.md)

### JavaScript ecosystem > TypeScript 🔵

- [Incremental Build](../js-es/typescript/optimizations/incremental-build.md)
