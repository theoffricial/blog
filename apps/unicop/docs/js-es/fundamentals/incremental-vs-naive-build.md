---
pagination_prev: js-es/fundamentals/index
pagination_next: null
last_update:
  date: 03/09/2022
  author: Ofri Peretz
---

# Build - Incremental vs. Naive 🧠

Generally speaking, reducing your project's build time can speed-up development, by simply get the build feedback faster. Although it is true, reducing build time requires expertise and takes time to master - so make sure you really need it.
A common way to reduce build times is to make your compiler/transpiler smarter by making it incremental instead of naive.

## Naive Build 🏷

When a compiler/transpiler program save no information on previous compilation, due to that reason the next build will require to build the whole program once again.

## Incremental Build 🏷

Incremental build - When a compiler/transpiler program save information on previous compilation, the information lets the compiler/transpiler to find the least costly way to do the compilation next time, e.g. avoid re-building unnecessary components according to the changes made from last compilation.
The information usually maps the project dependencies graph and use it to re-build only parts that depend on the latest changes, which each tool implements it in its own method.

## References 🔗

- **[TypeScript - Optimizations - Incremental Builds ⚡️](../typescript/optimizations/incremental-builds.md)**
- **[TypeScript - Optimizations - Project References Explained 🧬](../typescript/optimizations/project-references-explained/index.md)**
