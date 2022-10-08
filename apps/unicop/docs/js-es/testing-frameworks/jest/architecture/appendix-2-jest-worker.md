# Unit Tests - Jest - Architecture - jest-worker Appendix

The jest system requires many I/O operations from access files and the need for cache, and due to the fact the node is a single thread technology, forking multiple process to load and do calculation are extremely important for the test run time.

So the jest team created the [jest-worker][jw] as a solution for executing heavy tasks under forked processes in parallel. They great part that [jest-worker][jw] is an independent package that can parallelize any task, and it means that you can adopt it as a solution for your own needs.

It is great because myself can treat [jest-worker][jw] an amazing solution I can use for my own needs knowing that it made by the best, and used by millions.

The [jest-worker][jw] module works by providing an absolute path of the module to be loaded in all forked processes. All methods are exposed on the parent process as promises, so they can be `await`'ed. Child (worker) methods can either be synchronous or asynchronous.

## How Jest Use Jest-Worker

### 1. Build File Map & Module Resolution

While jest is using the `jest-haste-map` package that find all files in the project, access them and collect their metadata including dependencies,
`jest-haste-map` call jest-worker to execute the I/O and metadata extraction actions in parallel.

You can read the full explanation of that process at the [5. FS & Dependency Resolution](./2-dependency-resolutions.md) chapter.

### 2. Run Tests

[jw]: https://github.com/facebook/jest/tree/main/packages/jest-worker

When the `TestScheduler` schedule `jest-runner`/s to run, by default `jest-runner` call [jest-worker][jw] to run tests in parallel to complete the test run quickly as possible.

You can read the full explanation of that process at the [4. Run Tests](./4-running-tests.md) chapter.

## How the Eco-System Use Jest-Worker

Because it is generic and is a well solution made by the best, there are more than 600 packages at `npm` that depends on [jest-worker][jw], and many of them are bundler optimization plugins and static code analysis like eslint.
Like testing frameworks bundlers and static code analysis have to heavily deal with I/O and file access tasks.

Some of the most popular packages that use jest-worker:

- [terser-webpack-plugin](https://www.npmjs.com/package/terser-webpack-plugin)
- [rollup-plugin-uglify](https://www.npmjs.com/package/rollup-plugin-uglify)
- [rollup-plugin-terser](https://www.npmjs.com/package/rollup-plugin-terser)
- [eslint-webpack-plugin](https://www.npmjs.com/package/eslint-webpack-plugin)
- [css-minimizer-webpack-plugin](https://www.npmjs.com/package/css-minimizer-webpack-plugin)
- [metro](https://www.npmjs.com/package/metro)
