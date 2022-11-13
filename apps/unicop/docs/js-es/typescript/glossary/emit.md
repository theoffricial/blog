# `emit`

Emit is the action of the [TypeScript compiler](./ts-compiler.md) to create output files of all kinds (`.js`, `.d.ts`, `.js.map`, `.d.ts.map`)

[tsc](./ts-compiler.md) emits source-code into output after [type-checking](./type-checking.md).

There are several configuration options that affect the behavior of emitting,

A popular option is [noEmit](https://www.typescriptlang.org/tsconfig/#noEmit), that when configure TypeScript won't emit any output,
This lets TypeScript to be interoperability with other tools, for example to make room for other tools like Babel, or swc to handle converting the source-code.

Without emitting [tsc](./ts-compiler.md) can be used as a tool for providing editor integration, and a source-code type-checker only, for instance when working with bundler such as webpack.
