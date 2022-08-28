# Compiler Vs. Transpiler 📜

Too many popular tools in the JS eco-system have mixed the difference between of compiler and transpiler, that causes a huge confusion among developers.

From my experience, the ability to differentiate between them improved me dramatically as a JS eco-system developer in my ability to search and learn quicker new tools.

---

## Compiler Definition 🏷

A **compiler** is an umbrella term to describe a program that takes source code written in one language and produce a (or many) output file in some other language. In practice we mostly use this term to describe a compiler such as gcc which takes in C code as input and produces a binary executable (machine code) as output.

Compilers Examples

- **The JavaScript Interpreter** (turns JavaScript code into machine-level code)
- **The C# Compiler**

---

## Transpiler Definition 🏷

A **transpilers** (also called "Transformers") are also known as source-to-source compilers. So in essence they are a subset of compilers which take in a source code file and convert it to another source code file in some other language or a different version of the same language. The output is generally understandable by a human. This output still has to go through a compiler or interpreter to be able to run on the machine.

- **TypeScript Compiler, or "tsc"** - transpile TS into JS, that humans can read
- **Babel** - transpile higher version JS to lower version JS (e.g. es2022 to es5)
- **Jest Transforms** - turns each module jest maps into JS with CommonJS module system
- **Packages and Modules Bundlers** - tools like `webpack` transpile each module it finds into JS (optimizations and minifying are not relevant to here)

---
