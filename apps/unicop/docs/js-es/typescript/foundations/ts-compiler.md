# The TypeScript Compiler, or `tsc`

While JavaScript is typically associated with browsers, it can also work on servers or the command line with Node.js. Typescript's build process is composed of Node.js scripts.

In fact, the `tsc` is actually a [transpiler](../../foundations/transpiler.md), and not a [compiler](../../foundations/compiler.md), because it "compiles" TypeScript code into JavaScript and not a binary code, which means the it leaves Node.js or browsers the task to interpret the output JavaScript into machine code.

Because TypeScript broke into the JS eco-system replacing JavaScript development with strongly-typed language, on the technical side it constraints the TypeScript compiler to not only [emit](./emit.md) code, but also [type-checking](./type-checking.md) it, Unlike other [transpiler](../../foundations/transpiler.md)s such as Babel.

## The Technical Implementation

The scripts for the typescript project can be found in their [package.json](https://github.com/microsoft/TypeScript/blob/main/package.json) file. The `build:compiler` script runs this [gulpfile](https://github.com/microsoft/TypeScript/blob/main/Gulpfile.mjs), and part of what the gulp file does is run [this file](https://github.com/microsoft/TypeScript/blob/main/scripts/build/projects.mjs). That file executes `./lib/tsc`, thus running the typescript [compiler](../../foundations/transpiler.md) that's found in the `lib` directory, which then compiles the typescript code it was passed in. Note that the result is not a binary, it's a javascript file; the same (or similar) javascript file found at `./lib/tsc`
