# Unit Tests - Jest - Mock Injection

## Identify dependencies

To get a module dependencies, `jest-haste-map` calls the `fb-watchman` package, what it does is to get the main folder as an input, and then track the file system operations in that folder, then it does 2 things

- list all files as an output
- Track what files has changed (removed/added/modified) since the last time it called

After `jest` what test files to run, figure out the configs associated with the test run, it needs to understand the codebase it is operates on.

For that `jest` does static analysis to understand how to run tests really quickly, but also on how to do dependency resolutions to figure out how to track specific changes on files back to which tests are affected by that to do it, jest using an internal package call `jest-haste-map`

`jest` does magics such as of understand what test files to run, figure out the configs associated with the test run, and understand how the codebase it operates on

jests bounds the `require` to custom implementation jest manages internal that calculates whether to return the actual module or mock module `requireModuleOrMock(from, moduleName)`

<!-- node global function with an internal function call `requireModuleOrMock(from, moduleName)` -->

`jest-haste-map` uses [fb-watchman](https://github.com/facebook/watchman) to scan the file system and map all module in an internal file-system mapping developed by facebook long time ago, for the time there was no modules at all, this module system call `haste` and that is this where the name come from.

`fb-watchman` is in charge to scan the file system of your project, and catch everything so when changes happen, it will scan only them.

- moduleName - the relative path when we call `const myModule = require('XXXXXXX')`
- from - pre- .bind(this, from.filename) internally in `jest-runtime`

```js
// jest-runtime/build/index.js

// ...
_execModule(localModule, options, moduleRegistry, from) {
    // ...
    // For the current module jest executes,
    // jest binds the 'require' keyword to the return from '_createRequireImplementation'.
    Object.defineProperty(module, 'require', {
      value: this._createRequireImplementation(module, options)
    });
    // ...
}
// ...
_createRequireImplementation(from, options) {
    // ...
    const moduleRequire = options?.isInternalModule
        ? // internal module = jest modules
            (moduleName) => this.requireInternalModule(from.filename, moduleName)
        : // For any other module any other module
            this.requireModuleOrMock.bind(this, from.filename);
    // ...
    // jest returns the relevant function for the module being executed
    return moduleRequire;
}

requireModuleOrMock(from, moduleName) {
    // ...
    // And jest returns if the current module should be resolved as a mock or the actual module.
    if (...) {
        return this.requireMock(from, moduleName);
    } else {
        return this.requireModule(from, moduleName);
    }
    // ...
}
```
