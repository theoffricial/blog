---
slug: javascript-module-systems-explained
title: JavaScript Module Systems Explained 🫀
pagination_prev: js-es/glossary/index
pagination_next: null
authors: [unicop]
tags: [JavaScript, Modules]
last_update:
  date: 03/09/2022
  author: Ofri Peretz
---

## A background on JavaScript Module Systems 🐾

During the time JavaScript released back in 2005, unlike languages such as `C#`, The JavaScript language developed and improved by its ecosystem, which has pros like enhancing very fast, but on the other hand, does not necessarily follow agenda that causes duplicate work and sometimes unhealthy competitiveness and ego fights.

These is why four (without including `UMD`) different `module systems` developed during JavaScript has released, you can find more detailed background on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#a_background_on_modules).

## What Module Systems Exists

### 🧩 **Raw `<script>`**

**Raw `<script>`**s loading (The original use of `JavaScript`), where dependencies are implicit, and exports are overloaded onto the `window` object, weirdly this convention has no name.

### 🧩 **Asynchronous Module Definition, or shortly "AMD"**

**[Asynchronous Module Definition, or shortly "AMD"](https://jameshfisher.com/2020/10/03/what-are-amd-modules/)**, where a module calls `define(dependencies, callback)` used by tools like [RequireJS](https://requirejs.org/).

- module keywords: `define`

### **🧩 CommonJS**

**[CommonJS](https://jameshfisher.com/2020/09/27/what-does-the-require-function-do-in-nodejs/)**, where a module’s dependencies are synchronously, dynamically `require()`d, and its exports are placed on an `module.exports object`.

- module keywords: `require`, `module.exports`, `exports`

### **🧩 ECMAScript modules, or "ESM"**

**[“ECMAScript modules”](https://jameshfisher.com/2020/09/25/javascript-modules-for-grumpy-developers-from-2005/)**, or `"ESM"`, where a module’s dependencies are statically imported before execution, and its exports are statically defined, as top-level variables.

- module keywords: `import`, `export`, `export default`

As you can see, the eco-system is messy, but the mess just drove it to develop a fifth module system (😵‍💫), that makes order in the mess, and that is `Universal Module Definition`, or shortly `“UMD”`.

🧩 **[UMD module](https://jameshfisher.com/2020/10/04/what-are-umd-modules/)** is a `JavaScript` script, that guess during runtime which module system it’s being used in, and then it acts as that kind of module. So you can load the file in a plain `<script>`, or you can load it from an `AMD` module loader, or you can load it as a `Node.js module`, and it will always do something sensible. Here is the **[basic pattern](https://github.com/umdjs/umd/blob/master/templates/commonjsStrict.js)** that makes `UMD` to work.

- Important Note: `UMD` supports all module systems but `ESM`.

## Compatibility

- **[Compatibility Table 📐](./modules/modules-compatibility.md)**

## Credits 🎖️

This blog post inspired by **[jameshfisher](https://jameshfisher.com/)** blog, and I added links to his examples for each module system.
