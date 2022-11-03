# CommonJS Modules 🏷️

:::note
🔙 to **[Modules Summary](./summary.md)**.

:::

CommonJS modules are the original way to package JavaScript code for Node.js.

In Node.js, each file is treated as a separate module. For example, consider a file named `foo.js`:

```js
const circle = require('./circle.js');
console.log(`The area of a circle of radius 4 is ${circle.area(4)}`);
```

On the first line, `foo.js` loads the module `circle.js` that is in the same directory as `foo.js`.

Here are the contents of `circle.js`:

```js
const { PI } = Math;

exports.area = (r) => PI * r ** 2;

exports.circumference = (r) => 2 * PI * r;
```

The module `circle.js` has exported the functions `area()` and `circumference()`. Functions and objects are added to the root of a module by specifying additional properties on the special `exports` object.

Variables local to the module will be private, because the module is wrapped in a function (see the [module wrapper](#the-commonjs-module-wrapper)) by Node.js. In this example, the variable `PI` is private to `circle.js`.

The `module.exports` property can be assigned a new value (such as a function or object).

Below, `bar.js` makes use of the `square` module, which exports a Square class:

```js
const Square = require('./square.js');
const mySquare = new Square(2);
console.log(`The area of mySquare is ${mySquare.area()}`);
```

The `square` module is defined in `square.js`:

```js
// Assigning to exports will not modify module, must use module.exports
module.exports = class Square {
  constructor(width) {
    this.width = width;
  }

  area() {
    return this.width ** 2;
  }
};
```

The CommonJS module system is implemented in the [`module` core module](https://nodejs.org/api/module.html).

## The CommonJS module wrapper

Before a module's code is executed, Node.js will wrap it with a function wrapper that looks like the following:

```js
(function (exports, require, module, __filename, __dirname) {
  // Module code actually lives in here
});
```

By doing this, Node.js achieves a few things:

- It keeps top-level variables (defined with `var`, `const`, or `let`) scoped to the module rather than the global object.

- It helps to provide some global-looking variables that are actually specific to the module, such as:
  - The `module` and `exports` objects that the implementor can use to export values from the module.
  - The convenience variables `__filename` and `__dirname`, containing the module's absolute filename and directory path.

## The module scope

### `__dirname`

- `<string\>`

The directory name of the current module. This is the same as the `path.dirname()` of the `__filename`.

Example: running node `example.js` from `/Users/mjr`

```js
console.log(__dirname);
// Prints: /Users/mjr
console.log(path.dirname(__filename));
// Prints: /Users/mjr
```

### `__filename`

- `<string\>`

The file name of the current module. This is the current module file's absolute path with symlinks resolved.

For a main program this is not necessarily the same as the file name used in the command line.

See `__dirname` for the directory name of the current module.

Examples:

Running node `example.js` from `/Users/mjr`

```js
console.log(__filename);
// Prints: /Users/mjr/example.js
console.log(__dirname);
// Prints: /Users/mjr
```

Given two modules: `a` and `b`, where `b` is a dependency of a and there is a directory structure of:

- `/Users/mjr/app/a.js`
- `/Users/mjr/app/node_modules/b/b.js`

References to `__filename` within b.js will return `/Users/mjr/app/node_modules/b/b.js` while references to `__filename` within `a.js` will return `/Users/mjr/app/a.js`.

### `exports`

- `<Object\>`

A reference to the `module.exports` that is shorter to type. See the section about the exports shortcut for details on when to use exports and when to use module.exports.

### `module`

- [<module\>](https://nodejs.org/api/modules.html#the-module-object)

A reference to the current module, see the section about the [module object](https://nodejs.org/api/modules.html#the-module-object). In particular, `module.exports` is used for defining what a module exports and makes available through `require()`.

### `require(id)`

- id `<string\>` module name or path
- Returns: `<any\>` exported module content

Used to import modules, `JSON`, and local files. Modules can be imported from `node_modules`. Local modules and `JSON` files can be imported using a relative path (e.g. `./`, `./foo`, `./bar/baz`, `../foo`) that will be resolved against the directory named by `__dirname` (if defined) or the current working directory. The relative paths of [POSIX](https://en.wikipedia.org/wiki/POSIX) style are resolved in an OS independent fashion, meaning that the examples above will work on Windows in the same way they would on Unix systems.

```js
// Importing a local module with a path relative to the `__dirname` or current
// working directory. (On Windows, this would resolve to .\path\myLocalModule.)
const myLocalModule = require('./path/myLocalModule');

// Importing a JSON file:
const jsonData = require('./path/filename.json');

// Importing a module from node_modules or Node.js built-in module:
const crypto = require('node:crypto');
```

## `exports` shortcut

The `exports` variable is available within a module's file-level scope, and is assigned the value of `module.exports` before the module is evaluated.

It allows a shortcut, so that `module.exports.f = ...` can be written more succinctly as `exports.f = ...`. However, be aware that like any variable, if a new value is assigned to `exports`, it is no longer bound to `module.exports`:

```js
module.exports.hello = true; // Exported from require of module
exports = { hello: false }; // Not exported, only available in the module
```

When the `module.exports` property is being completely replaced by a new object, it is common to also reassign `exports`:

```js
module.exports = exports = function Constructor() {
  // ... etc.
};
```

To illustrate the behavior, imagine this hypothetical implementation of `require()`, which is quite similar to what is actually done by `require()`:

```js
function require(/* ... */) {
  const module = { exports: {} };
  ((module, exports) => {
    // Module code here. In this example, define a function.
    function someFunc() {}
    exports = someFunc;
    // At this point, exports is no longer a shortcut to module.exports, and
    // this module will still export an empty default object.
    module.exports = someFunc;
    // At this point, the module will now export someFunc, instead of the
    // default object.
  })(module, module.exports);
  return module.exports;
}
```

## Credit 🎖️

- Node.js Official Docs
