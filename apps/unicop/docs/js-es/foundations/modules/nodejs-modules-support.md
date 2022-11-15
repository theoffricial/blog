# Node.js Modules Support

Node.js has two module systems: `CommonJS` modules and `ECMAScript modules (ESM)`.

## How to Work with CommonJS

CommonJS modules are the original way to package JavaScript code for Node.js.

By default, Node.js will treat the following as CommonJS modules:

- Files with a `.cjs` extension;

- Files with a `.js` extension when the nearest parent `package.json` file contains a top-level field `"type"` with a value of `"commonjs"`.

- Files with a `.js` extension when the nearest parent `package.json` file doesn't contain a top-level field `"type"`. Package authors should include the `"type"` field, even in packages where all sources are CommonJS. Being explicit about the type of the package will make things easier for build tools and loaders to determine how the files in the package should be interpreted.

- Files with an extension that is not `.mjs`, `.cjs`, `.json`, `.node`, or `.js` (when the nearest parent `package.json` file contains a top-level field `"type"` with a value of `"module"`, those files will be recognized as CommonJS modules only if they are being `require`d, not when used as the command-line entry point of the program).

See Determining module system for more details.

Calling `require()` always use the CommonJS module loader. Calling `import()` always use the ECMAScript module loader.

## How to Work with ECMAScript Modules (ESM)

Node.js also supports the [ECMAScript modules](https://nodejs.org/api/esm.html#enabling) standard used by browsers and other JavaScript runtimes.

Node.js will treat the following as ES modules when passed to node as the initial input, or when referenced by `import` statements or `import()` expressions:

- Files with an `.mjs` extension.

- Files with a `.js` extension when the nearest parent package.json file contains a top-level `"type"` field with a value of `"module"`.

- Strings passed in as an argument to `--eval`, or piped to node via `STDIN`, with the flag `--input-type=module`.

Node.js fully supports ECMAScript modules as they are currently specified and provides interoperability between them and its original module format, CommonJS.

:::note

Node.js official docs references:

- [Determining module system](https://nodejs.org/api/packages.html#determining-module-system)
- [Node.js and ECMAScript modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules)
- [Node.js and CommonJS modules](https://nodejs.org/api/modules.html#modules-commonjs-modules)

:::

## See also
