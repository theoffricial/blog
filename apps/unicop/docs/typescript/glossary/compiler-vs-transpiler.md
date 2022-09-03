---
pagination_prev: typescript/glossary/index
pagination_next: null
last_update:
  date: 03/09/2022
  author: Ofri Peretz
---

# Compiler Vs. Transpiler 📜

Too many popular tools in the JS eco-system have mixed the difference between of compiler and transpiler, that causes a huge confusion among developers.

From my experience, the ability to differentiate between the terms improved me dramatically as a JS eco-system developer in my ability to search, learn new tools and to communicate more accurately.

In the JS eco-system the only compiler exists is the JavaScript Interpreter, while all other tools are actually transpilers.

---

## Compiler Definition 🏷

A **compiler** is an umbrella term to describe a program that takes source code written in one language and produce a (or many) output file in some other language. In practice we mostly use this term to describe a compiler such as gcc which takes in C code as input and produces a binary executable (machine code) as output.

### Compilers Examples

- **The JavaScript Interpreter** (turns JavaScript code into machine-level code)
- **gcc** - C code compiler - takes in C code as input and produces a **binary executable as output**

---

## Transpiler Definition 🏷

A **transpiler**, also called in different tools in the JS eco-system "transformer", can be describe as a source-to-source compiler. So in essence transpiler is a subset of compiler which take in a source code file and convert it to another source code file in some other language or a different version of the same language. The output is generally understandable by a human. This output still has to go through a compiler or interpreter to be able to run on the machine.

### Transpilers Examples

- **TypeScript Compiler, or "tsc"** - transpile TS into JS, that is understandable by a human
- **Babel** - transpile one version JS to another version JS (e.g. es2022 to es5)
- **Jest Transformer** - Execute before each jest execution after jest maps all modules, then the transformer will transpile, or "transform", each module into a module that jest can work with - which means JavaScript file that defines with CommonJS module system.
- **Packages and Modules Bundlers** - tools like `webpack` transpiles each module it finds the desired JS version, the bundlers' extensions or loaders are simply programs that can transpile a specific type of file into a JS file, e.g. css-loader transpiles CSS file into JS Module. <br/>
  Bundlers optimizations and minification are different stages/abilities of bundlers, which happens after the transpilation.

---
