---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_updated:
  date: 11/25/2022
  author: Ofri Peretz
---

# AMD Modules 🏷️

:::note
🔙 to **[Modules Summary](./summary.md)**.

:::
:::note
AMD is an old module system and almost not in use.
It is important to be familiar with it, but not recommended to use.

:::

## Definition

Using JavaScript functions for encapsulation has been documented as the module pattern:

```js
(function () {
  // the code here is encapsuled which makes similar to
  // the definition of module
  this.myGlobal = function () {};
})();
```

That type of module relies on attaching properties to the global object to export the module value, and it is difficult to declare dependencies with this model. The dependencies are assumed to be immediately available when this function executes. This limits the loading strategies for the dependencies.

AMD addresses these issues by:

- Register the factory function by calling `define()`, instead of immediately executing it.
- Pass dependencies as an array of string values, do not grab globals.
- Only execute the factory function once all the dependencies have been loaded and executed.
- Pass the dependent modules as arguments to the factory function

```js
//Calling define with a dependency array and a factory function
define(['dep1', 'dep2'], function (dep1, dep2) {
  //Define the module value by returning a value.
  return function () {};
});
```

## Named Modules

Notice that the above module does not declare a name for itself. This is what makes the module very portable. It allows a developer to place the module in a different path to give it a different ID/name. The AMD loader will give the module an ID based on how it is referenced by other scripts.

However, tools that combine multiple modules together for performance need a way to give names to each module in the optimized file. For that, AMD allows a string as the first argument to `define()`:

```js
//Calling define with module ID, dependency array, and factory function
define('myModule', ['dep1', 'dep2'], function (dep1, dep2) {
  //Define the module value by returning a value.
  return function () {};
});
```

You should avoid naming modules yourself, and only place one module in a file while developing. However, for tooling and performance, a module solution needs a way to identify modules in built resources.

## Sugar Syntax (That reminds CommonJS but it doesn't!)

The above AMD example works in all browsers. However, there is a risk of mismatched dependency names with named function arguments, and it can start to look a bit strange if your module has many dependencies:

```js
define([
  'require',
  'jquery',
  'blade/object',
  'blade/fn',
  'rdapi',
  'oauth',
  'blade/jig',
  'blade/url',
  'dispatch',
  'accounts',
  'storage',
  'services',
  'widgets/AccountPanel',
  'widgets/TabButton',
  'widgets/AddAccount',
  'less',
  'osTheme',
  'jquery-ui-1.8.7.min',
  'jquery.textOverflow',
], function (
  require,
  $,
  object,
  fn,
  rdapi,
  oauth,
  jig,
  url,
  dispatch,
  accounts,
  storage,
  services,
  AccountPanel,
  TabButton,
  AddAccount,
  less,
  osTheme
) {});
```

To make this easier, and to make it easy to do a simple wrapping around [CommonJS](./commonjs.md) modules, this form of define is supported, sometimes referred to as "simplified CommonJS wrapping":

```js
define(function (require) {
  var dependency1 = require('dependency1'),
    dependency2 = require('dependency2');

  return function () {};
});
```

The AMD loader will parse out the `require('')` calls by using Function.prototype.toString(), then internally convert the above define call into this:

```js
define(['require', 'dependency1', 'dependency2'], function (require) {
  var dependency1 = require('dependency1'),
    dependency2 = require('dependency2');

  return function () {};
});
```

This allows the loader to load `dependency1` and `dependency2` asynchronously, execute those dependencies, then execute this function.

## See also

### Software Foundations 🏗️

- [Compiler](../../../foundations/compiler.md)
- [Run-time](../../../foundations/run-time.md)

### JS ecosystem > TypeScript 🔵

- [JavaScript Module Systems Summary 🫀](./summary.md)
- [Modules Bundler](modules-bundler.md)
