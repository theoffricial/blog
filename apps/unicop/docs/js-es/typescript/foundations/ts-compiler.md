# The TypeScript Compiler, or `tsc` 🔵🏷️

In TypeScript, the [compiler](../../foundations/compiler.md) is the component that makes all the difference between TypeScript and JavaScript.

The compiler enables TypeScript to be a strongly-typed language, by supporting both [type checking](./type-checking.md), and be a [build tool](../../foundations/build.md#build-tools) by [emit](./emit.md) TypeScript source code to JavaScript which cans anywhere JavaScript runs: In a browser, and JavaScript runtimes like Node.js or Deno and in your apps (see [full compatibility](../../foundations/modules/modules-compatibility.md)).

An interesting fact, in which according to definitions the TypeScript compiler is actually a [transpiler](../../foundations/transpiler.md), and not a [compiler](../../foundations/compiler.md) as it called.

## See also

### Foundations 🏗️

- [Compiler 🏷️](../../foundations/compiler.md)
- [Transpiler 🏷️](../../foundations/transpiler.md)
- [Type Checking 🏷️](../../foundations/type-checking.md)

### TypeScript Foundations 🔵 🏗️

- [TypeScript > Type Checking 🔵🏷️](./type-checking.md)
- [TypeScript > Emit 🔵🏷️](./emit.md)

<!-- While JavaScript is typically associated with browsers, it can also work on servers or the command line with Node.js. Typescript's build process is composed of Node.js scripts. -->

<!-- , because it "compiles" TypeScript code into JavaScript and not a binary code, which means the it leaves Node.js or browsers the task to interpret the output JavaScript into machine code. -->

<!-- Because TypeScript broke into the JS eco-system replacing JavaScript development with strongly-typed language, on the technical side it constraints the TypeScript compiler to not only [emit](./emit.md) code, but also [type-checking](./type-checking.md) it, Unlike other [transpiler](../../foundations/transpiler.md)s such as Babel. -->

<!-- ## The Technical Implementation

The scripts for the typescript project can be found in their [package.json](https://github.com/microsoft/TypeScript/blob/main/package.json) file. The `build:compiler` script runs this [gulpfile](https://github.com/microsoft/TypeScript/blob/main/Gulpfile.mjs), and part of what the gulp file does is run [this file](https://github.com/microsoft/TypeScript/blob/main/scripts/build/projects.mjs). That file executes `./lib/tsc`, thus running the typescript [compiler](../../foundations/transpiler.md) that's found in the `lib` directory, which then compiles the typescript code it was passed in. Note that the result is not a binary, it's a javascript file; the same (or similar) javascript file found at `./lib/tsc` -->
