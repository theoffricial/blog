---
slug: js-module-systems
title: JS Modules Series - The Fundamental Disorder of the JS eco-system
authors: [unicop]
tags: [JavaScript, Modules]
---

# The JS Modules 🐘 Series

## What Module Systems Exists

During the time JavaScript released back in 2005, four different `“module” systems` developed in the eco-system:

🧩 **Raw `<script>`**s loading (The original use of `JavaScript`), where dependencies are implicit, and exports are overloaded onto the `window` object, weirdly this convention has no name.

🧩 **[Asynchronous Module Definition, or shortly "AMD"](https://jameshfisher.com/2020/10/03/what-are-amd-modules/)**, where a module calls `define(dependencies, callback)`.

- module keywords: `define`

🧩 **[CommonJS](https://jameshfisher.com/2020/09/27/what-does-the-require-function-do-in-nodejs/)**, where a module’s dependencies are synchronously, dynamically `require()`d, and its exports are placed on an `module.exports object`.

- module keywords: `require`, `module.exports`, `exports`

🧩 **[“ECMAScript modules”](https://jameshfisher.com/2020/09/25/javascript-modules-for-grumpy-developers-from-2005/)**, or `"ESM"`, where a module’s dependencies are statically imported before execution, and its exports are statically defined, as top-level variables.

- module keywords: `import`, `export`, `export default`

As you can see, the eco-system is messy, but the mess just drove it to develop a fifth module system (😵‍💫), that makes order in the mess, and that is `Universal Module Definition`, or shortly `“UMD”`.

🧩 **[UMD module](https://jameshfisher.com/2020/10/04/what-are-umd-modules/)** is a `JavaScript` script, that guess during runtime which module system it’s being used in, and then it acts as that kind of module. So you can load the file in a plain `<script>`, or you can load it from an `AMD` module loader, or you can load it as a `Node.js module`, and it will always do something sensible. Here is the **[basic pattern](https://github.com/umdjs/umd/blob/master/templates/commonjsStrict.js)** that makes `UMD` to work.

- Important Note: `UMD` supports all module systems but `ESM`.

###### Credit 🎖️

Inspired by **[jameshfisher](https://jameshfisher.com/)**
IMO he has great materials.

## What JavaScript based technology runs what module systems

✅ - Natively | 🧪 - Experimental | 📦 - With Module Bundler (e.g. webpack)

| Module System  | Browsers | Nodejs | <sub><sup>Nodejs based [1]</sup></sub> CLIs |
| :------------: | :------: | :----: | :-----------------------------------------: |
| Raw `<script>` |    ✅    |        |                                             |
|      AMD       |    ✅    |        |                                             |
|    CommonJS    |    📦    |   ✅   |                     ✅                      |
|      UMD       |    ✅    |   ✅   |                     ✅                      |
|      ESM       |    ✅    |   🧪   |                     🧪                      |

<sub><sup>[1] - <a href="https://jestjs.io/"><b>jest</b></a> for instance is a Nodejs based CLI</sup></sub>

## The isomorphic code confusion 🔮

The less obvious complication is browser compatibility.

Both Browsers and The NodeJS ecosystems initially started separate, but since tools like `webpack`, `parcels`, `rollup` and others enabled CommonJS modules to be used in the browser, the scene of isomorphic code, which runs both under NodeJS and the browser, has exploded.
Which caused everything to mixed up but where conflicts happens from time to time.

This is why `Transpilers` in the JS eco-system are so fundamental component, so let's understand what are they compared to compilers.

## Compiler Vs. Transpiler And the JavaScript eco-system 📜

- **Compiler** is an umbrella term to describe a program that takes source code written in one language and produce a (or many) output file in some other language. In practice we mostly use this term to describe a compiler such as gcc which takes in C code as input and produces a binary executable (machine code) as output.

Examples of compilers

- JavaScript Interpreter (turns JS into machine-level code)
- C# Compiler

- **Transpilers** (also called "Transformers") are also known as source-to-source compilers. So in essence they are a subset of compilers which take in a source code file and convert it to another source code file in some other language or a different version of the same language. The output is generally understandable by a human. This output still has to go through a compiler or interpreter to be able to run on the machine.

- `TypeScript Compiler, or tsc` - transpile TS into JS, that humans can read
- `babel` - transpile higher version JS to lower version JS (e.g. es2022 to es5)
- `jest's transformers` - turns each module jest maps into JS with CommonJS module system
- `module bundlers`, like `webpack` - transpile each module it finds into `JS` (optimizations and minifying are not relevant to here)

<!-- ## Common Errors Caused by the Isomorphic Confusion ⛔

- [TypeScript Jest "Cannot use import statement outside module"](./2022-07-28-typescript-jest-cannot-use-import-statement-outside-module.md) -->
