---
slug: js-modules/amd
title: AMD Modules Explained
authors: [unicop]
tags: [hola, docusaurus]
---

`Asynchronous Module Definition` or `“AMD”`, where a module calls `define(dependencies, callback)` (Plus a degenerate alternative form which unsafely wraps a CommonJS module; the less said about it, the better).

What are `AMD` modules? Fetch your sick bag
I don’t think anyone would object to the claim that JavaScript has too many module systems. From the olden days we have raw `<script>` loading, where dependencies are implicit, and exports are vomited onto the window object. `Node.js` gave us the `CommonJS` module system, where a module’s dependencies are synchronously, dynamically `require()`d, and its exports placed on an exports object. `ECMAScript` 2015 gave us `“ES modules”`, where a module’s dependencies are statically imported before execution, and its exports are statically defined, top-level variables.

Unfortunately, none of these systems are really acceptable for use in the browser. Raw `<script>`s aren’t acceptable because they’re ... not modules. `CommonJS` is not acceptable because it loads modules synchronously, but the necessary `HTTP` requests in the browser are fundamentally asynchronous. `ECMAScript` modules are not acceptable because they don’t have wide enough support yet.

So, enter `Asynchronous Module Definition`, or `AMD`. This appeared around 2011. `AMD` modules look like this:

```js
// This is https://example.com/modules/printCounter.js
define(['./counter', 'print'], function (counter, print) {
  // names of dependencies
  // the dependency modules passed in
  return {
    // our module object, with one function
    printAndIncrement: () => {
      print(counter.get());
      counter.increment();
    },
  };
});
```

You know you’re looking at `AMD` (or something like it) if you see calls to a define function, or the inclusion of an `“AMD loader”` script, like `<script src="lib/require.js"></script>`.

An AMD module like this assumes a global `define` function, which is provided by an `“AMD loader”` like `RequireJS`. The `AMD` loader knows how to load a module given its name. For example, the name `./counter` might map to the file `https://example.com/modules/counter.js`. The `AMD` loader loads this, e.g. by inserting `<script src='/modules/counter.js'></script>` into the document.

So far, sensible enough, but it all goes wrong from here. For some reason, `AMD` also defines a form called “Simplified CommonJS wrapping”, which might be the most disgusting thing in the `JavaScript` ecosystem. It claims to turn a `CommonJS` module into an AMD-compatible module, like this:

```js
define(function (require, exports, module) {
  var messages = require('./messages'); // synchronous, dynamic require!
  var print = require('print'); // just like in Node.js! <3
  print(messages.getHello());
});
```

But how the hell can the `AMD` loader turn those synchronous, dynamic require calls into asynchronous module loads?! Buckle up. The loader takes your function, and before calling it, it calls `.toString()` on the function (a feature that `JavaScript` really shouldn’t provide), then does some regex searches to find calls to require. Yep, it turns out regular expressions can solve the halting problem after all. To see the insanity, take the following module:

```js
define(function (require) {
  var someString = "require('./nonExistentModule')";
  print(someString);
});
```

This module will cause the loader to make an `HTTP` request for `nonExistentModule.js`, which of course causes an error. It makes me feel sick that someone even entertained the idea of making a module system this way.
