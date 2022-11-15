# `type-checking`

On TypeScript, the type-checking action happens statically in "compile-time", by the TypeScript compiler, which after type-checking, [emits](./emit.md) the output JavaScript code.

The approach of type-checking on the "compile-time" is common, because type-checking is an extremely heavy algorithm.

To type-checking, for every function, module or variable you call, all the types involved must be validated, and type information must be updated afterwards.

<!-- The TypeScript language has developed to static analysis type-checking in "compile-time" by the [TypeScript compiler (`tsc`)](./ts-compiler.md).

type-checking

As these two parts are separate, we can't use type checking in runtime. Only in "compile time". -->
