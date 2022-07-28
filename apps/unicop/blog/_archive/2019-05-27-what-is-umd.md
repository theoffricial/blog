---
slug: js-modules/UMD
title: UMD Modules Explained
authors: [unicop]
tags: [UMD, JS Module Systems]
---

## Why 💡

What are `UMD modules` ? One final module system to rule them all (except ES modules which are a different thing)

During the time JavaScript released back in 2005, four different `“module” systems` developed in the eco-system:

- The original use of `JavaScript`, Raw `<script>`s loading, where dependencies are implicit, and exports are overloaded onto the `window` object, weirdly this convention has no name.

- `Asynchronous Module Definition`, or shortly `“AMD”`, where a module calls `define(dependencies, callback)`.
  (Plus a degenerate alternative form which unsafely wraps a CommonJS module; the less said about it, the better).

- `CommonJS`, where a module’s dependencies are synchronously, dynamically `require()`d, and its exports are placed on an `module.exports object`.

- `“ECMAScript modules”`, where a module’s dependencies are statically imported before execution, and its exports are statically defined, as top-level variables.

As you can see, the eco-system is messy, but of course that this will be the trigger to define a fifth module system, to do order in the mess, and that is `Universal Module Definition`, or shortly `“UMD”`.

Simply, a `UMD module` is a `JavaScript` script, that guess during runtime which module system it’s being used in, and then it acts as that kind of module. So you can load the file in a plain `<script>`, or you can load it from an `AMD` module loader, or you can load it as a `Node.js module`, and it will always do something sensible.
