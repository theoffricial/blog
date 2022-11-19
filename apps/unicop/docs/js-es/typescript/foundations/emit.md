# `emit`

In TypeScript, the action of the TypeScript compiler to output files like JavaScript source code, source-maps or declarations. Called emit.

The TypeScript compiler emits source code after [type-checking](./type-checking.md)

## Compiler Interoperate

The TypeScript compiler, enables customizing the emit action to allow interoperate with other build tools like `Babel`, or `swc` to handle converting the TypeScript file to a file which can run inside a JavaScript environment (`.js`, `.d.ts`, `.js.map`, `.d.ts.map`).

TypeScript is also a tool for providing editor integration, and as a source code [type-checker](./type-checking.md).
