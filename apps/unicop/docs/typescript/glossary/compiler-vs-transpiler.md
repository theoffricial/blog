# Compiler Vs. Transpiler 📜

- A **compiler** is an umbrella term to describe a program that takes source code written in one language and produce a (or many) output file in some other language. In practice we mostly use this term to describe a compiler such as gcc which takes in C code as input and produces a binary executable (machine code) as output.

Examples of compilers

- JavaScript Interpreter (turns JS into machine-level code)
- C# Compiler

- A **transpilers** (also called "Transformers") are also known as source-to-source compilers. So in essence they are a subset of compilers which take in a source code file and convert it to another source code file in some other language or a different version of the same language. The output is generally understandable by a human. This output still has to go through a compiler or interpreter to be able to run on the machine.

- `TypeScript Compiler, or tsc` - transpile TS into JS, that humans can read
- `babel` - transpile higher version JS to lower version JS (e.g. es2022 to es5)
- `jest's transformers` - turns each module jest maps into JS with CommonJS module system
- `module bundlers`, like `webpack` - transpile each module it finds into `JS` (optimizations and minifying are not relevant to here)
