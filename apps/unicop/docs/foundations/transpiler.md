---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_updated:
  date: 11/25/2022
  author: Ofri Peretz
---

# Transpiler 🏷

A **transpiler**, describe as a source-to-source [compiler](./compiler.md). So in essence transpiler is a subset of [compiler](./compiler.md) which take in a source code file and convert it to another source code file in some other language or a different version of the same language. The output is generally understandable by a human. This output still has to go through a compiler or interpreter to be able to run by a machine.

In the JS eco-system tools often name transpilers differently which is quite confusing, common names for transpilers: compilers, e.g. the TypeScript Compiler, transformers (jest), bundlers (without optimizations they basically transpile code modules and bundle them into one file).

### Transpiler Examples

- **TypeScript Compiler, or "tsc"** - transpile TypeScript code to JavaScript code, which is understandable by a humans.
- **Babel** - A popular transpiler in the JS eco-system that originally developed to downgrade JavaScript by transpiling modern features into primitive ones, so code can be compatible with Node.js and browsers.
  Today it transpile many things, also TypeScript code to JavaScript with wide community plugins and presets.
- **Jest Transformer** - Jest transpile modules it maps into JavaScript modules it can execute, transformer is basically transpile.

## See also

### Software Foundations 🏗️

- [Compiler](./compiler.md)
- [Interpreter](./interpreter.md)

### Js ecosystem > Foundations 🏗️

- [Modules Bundler](../js-es/foundations/modules/modules-bundler.md)
- [JavaScript Engine 🏷](../js-es/foundations/js-engine.md)

### JS ecosystem > TypeScript 🔵

- [TypeScript Compiler](../js-es/typescript/foundations/ts-compiler.md)

### JS ecosystem > Testing Frameworks > Jest 🤡

- [Architecture 🏛 > Part 6. Module Transformation 🦠](../js-es/testing-frameworks/jest/architecture/part-6-modules-transformation.md)
