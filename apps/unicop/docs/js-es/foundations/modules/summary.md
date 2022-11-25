---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_updated:
  date: 11/25/2022
  author: Ofri Peretz
tags: [JavaScript, Modules]
---

# JavaScript Module Systems Summary 🫀

## A background on modules 🐾

When JavaScript released back in 2005 its programs started off pretty small, when in the early days was mostly used to do isolated scripting tasks, providing a bit of interactivity to your web pages where needed, so large scripts were generally not needed.
Fast forward a few years and we now have complete applications being run in browsers with a lot of JavaScript, as well as JavaScript being used in other contexts (Node.js, bun, and deno for example).

It has therefore made sense in recent years to start thinking about providing mechanisms for splitting JavaScript programs up into separate modules that can be imported when needed. Node.js has had this ability for a long time, and there are a number of JavaScript libraries and frameworks that enable module usage (for example, other [CommonJS](./commonjs.md) and [AMD](./amd.md)-based module systems like [RequireJS](https://requirejs.org), and more recently [Webpack](https://webpack.js.org) and [Babel](https://babeljs.io)).

The good news is that modern browsers have started to support module functionality natively, and this is what this article is all about. This can only be a good thing — browsers can optimize loading of modules, making it more efficient than having to use a library and do all of that extra client-side processing and extra round trips.

Use of native JavaScript modules is dependent on the ES module system using `import` and `export` statements; these are already supported in browsers, and server runtimes, as shown in the [compatibility summary article](./modules-compatibility.md).

## The Influence of Lack of Module Standard For Until Recently

Because it took long time to come into an agreed module system standard in the eco-system, multiple module systems gained popularity which creates many compatibility issues, and long adjustments many tools as to do these days, although the road map is clear - the eco-system is making big steps into a reality where all popular tools are using [ESM](./esm.md) only.

But because all module systems are still relevant, I am covering all module systems exist in my blog, below is a short summary for each system with a link into a longer explanation.

## The JS eco-system Module Systems Summary

- **[Raw <script\>](./raw.md)**s loading (The original usage of `JavaScript`), where dependencies are implicit, and exports are being overloaded onto the `window` object, weirdly this convention has no formal name.

- **[Asynchronous Module Definition, or "AMD"](./amd.md)**, where a module calls `define(dependencies, callback)` implemented by libraries like [RequireJS](https://requirejs.org/), where dependencies defined by file names and the callback is the actual module. <br /> module is defined by: `define`.

- **[CommonJS](./commonjs.md)**, where a module’s dependencies are synchronously, dynamically `require()`d, and its `exports` are placed on an `module.exports object`. <br /> module is defined by: `require`, `module.exports`, `exports`

- **[ECMAScript modules, or "ESM"](./esm.md)**, where a module’s dependencies are statically imported before execution, and its exports are statically defined, as top-level variables. <br/>module is defined by: `import`, `export`

The inflation in the number of module systems, led to the invention of a fifth that should rule all other systems (except [ESM](./esm.md) which released later), which is the [Universal Module Definition, or "UMD"](./umd.md) module system.

🧩 **[UMD module](./umd.md)** is a `JavaScript` script, that figures out during runtime which module system it’s being used in, and then it acts as that kind of module. It support [Raw <script\>](./raw.md), [AMD](./amd.md), and [CommonJS](./commonjs.md) modules, and it will work.

## See also

### JS ecosystem > Foundations 🏗️ > Modules

- [Compatibility Table 📐](./modules-compatibility.md)
- [CommonJS 🏷️](./commonjs.md)
- [AMD 🏷️](./amd.md)
- [UMD 🏷️](./umd.md)
- [ESM 🏷️](./esm.md)
- [Raw Script 🏷️](./raw.md)
- [Modules Bundler 🏷️](./modules-bundler.md)
- [Node.js Modules Support 🎗](./nodejs-modules-support.md)
