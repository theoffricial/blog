---
slug: js-modules/commonjs
title: CommonJS Modules Explained
authors: [unicop]
tags: [hola, docusaurus]
---

CommonJS module system, where a module’s dependencies are synchronously, dynamically `require()`d, and its exports are placed on an `module.exports` object.

## Natively supported by

- Nodejs

## CommonJS module example

```js
let x = 42;
exports.x = x;
exports.increment = function () {
  x++;
};
```

Then to use it:

```bash
> require('myModule.js')
Uncaught Error: Cannot find module 'myModule.js'
```

Whoops, Node.js can’t even find our module. This very unhelpful error message is because, to load a file with a relative path, we have to use an explicit ./ prefix:

```bash
> const m = require('./myModule.js')
undefined
> m.x
5
> m.increment()
undefined
> m.x
5
```

A CommonJS module exports things by adding properties to an exports object. Our module exports an x and an increment. But if you’ve used ECMAScript modules, this module might not work as you expected: m.x does not get incremented after calling `m.increment()`!

The original variable x does get incremented, but m.x is not a reference to that variable. The line `exports.x = x` copies the value of x, rather than making a reference to it. This is different to the “live binding” semantics of ECMAScript modules. To make this work as expected, we can export a getter function:

```js
exports.x = () => x;
```

As you can see, CommonJS modules can have internal state. requireing a module multiple times will only execute the module script once, and return the same exports object from every require call. Thus, the module’s state can be shared. For example:

```js
const m1 = require('./myModule.js');
const m2 = require('./myModule.js');
console.log(m1.x()); // logs 5
m2.increment();
console.log(m1.x()); // logs 6
```

So this is how you load a local module you’ve written. But what about external “packages”? Every Node.js developer has written const express = require('express'), but what does this do? [The full search algorithm](https://nodejs.org/api/modules.html#all-together) is a bit horrifying. But in a standard setup, this loads the JavaScript file at ./node_modules/express/index.js. You can equivalently write const express = require('./node_modules/express/index.js'). You can also use require.resolve to debug it:

```bash
> require.resolve('express')
'/Users/jim/dev/tmp/node_require/node_modules/express/index.js'
```

According to the algorithm, before finding `./node_modules/express/index.js`, it tried looking for express in the core Node.js modules. This didn’t exist, so it looked in node_modules, and found a directory called express. (If there was a `./node_modules/express.js`, it would load that directly.) It then loaded `./node_modules/express/package.json`, and looked for an exports field, but this didn’t exist. It also looked for a `main` field, but this didn’t exist either. It then fell back to `index.js`, which it found.

It’s a bit deceptive that Node.js looks in package.json files. It gives the impression that Node.js knows about packages, but actually Node.js (should) really only know about modules. NPM, a package manager, only really knows about packages. Some things like express are both Node.js modules and NPM packages. Other things are Node.js modules, but not NPM packages (like a local file `./myModule.js`); Yet other things are NPM packages, but not Node.js modules (like this Python package on NPM).

When a module has its own dependencies, how do these get resolved? The express module has a call to `require('body-parser')`. You might think that it has its own `node_modules`, like `./node_modules/express/node_modules/body-parser/index.js`. If this was present, it would load! However, this is unconventional; typically all recursive subdependencies are flattened into one big `node_modules` directory. To make this work, `require()` looks for `node_modules` in all of the parent directories of the caller.
