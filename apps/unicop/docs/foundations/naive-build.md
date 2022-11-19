# Naive Build 🏷

Naive Build is when a project build command is "just" building the project without saving information that can assist building the project faster on the next time running the build command.

When no information is being stored, the next build run would have to build the entire project from scratch once again.

Today, most modern build tools, e.g. [transpilers](./transpiler.md), [compilers](./compiler.md), [modules bundlers](./modules/modules-bundler.md), etc. are not naive by default, or support advance options to enable [Incremental Build](./incremental-build.md).

## See also

### Foundations 🏗️

- [Build 🏷️](./build.md)
- [Compiler 🏷️](./compiler.md)
- [Modules Bundler 🏷️](./modules/modules-bundler.md)
- [Incremental Build 🏷️](./incremental-build.md)
- [Transpiler](./transpiler.md)

### TypeScript

- [TypeScript > Incremental Build](../typescript/optimizations/incremental-build.md)
