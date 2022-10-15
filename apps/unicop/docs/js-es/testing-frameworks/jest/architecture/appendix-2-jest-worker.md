# Unit Tests - Jest - Architecture - jest-worker Appendix

The jest system requires some heavy I/O operations like files access, cache CRUD, and module transformation.

Because nodejs is a single thread technology, forking blocking tasks, e.g. I/O ops, into multiple processes is extremely important for achieving shorter test run time.

In fact, because this issue is so centric in the problems jest is facing,
the jest team created [jest-worker][jw] as a core module as the solution to manage execution for heavy tasks that can be run in parallel.

The [jest-worker][jw] is generic meaning it can run any task, not just jest tasks and also it is an independent package, it means you can take it and use it for your own needs.

The [jest-worker][jw] module works by providing an absolute path of the module to be loaded in all forked processes. All methods are exposed on the parent process as promises, so they can be `await`'ed. Child (worker) methods can either be synchronous or asynchronous.

## How Jest Config Can Utilize `jest-worker`

`jest-worker` is optimized to complete tasks as quickest as possible, It does it by checking the number of available cores on the CPU, and ideally uses them all. That is greedy behavior, that sometimes leads jest to consume too much memory or too many CPU that might slow down the machine it is operating on (personally I experienced it mostly on CI pipelines), To limit `jest-worker` you can use the [maxWorkers](https://jestjs.io/docs/configuration#maxworkers-number--string) option to limit the number of threads jest allowed to use in parallel.

## How Jest Uses `jest-worker`

### 1. Build File Map & Module Resolution

While jest is using the `jest-haste-map` package that find all files in the project, access them and collect their metadata including dependencies,
`jest-haste-map` call jest-worker to execute the I/O and metadata extraction actions in parallel.

You can read the full explanation of that process at the [5. FS & Dependency Resolution](./2-dependency-resolutions.md) chapter.

### 2. Run Tests

[jw]: https://github.com/facebook/jest/tree/main/packages/jest-worker

When the `TestScheduler` schedule `jest-runner`/s to run, by default `jest-runner` call [jest-worker][jw] to run tests in parallel to complete the test run quickly as possible.

You can read the full explanation of that process at the [4. Run Tests](./4-test-run.md) chapter.

## How JS Eco-System Uses `jest-worker`

As mentioned above, as an independent package, other packages can leverage `jest-worker` to their own needs.

A quick search in NPM found that +600 public packages are using `jest-worker`,
Where the most popular of them are module bundlers and module bundlers' plugins.

Here sharing a short list of some of the popular packages that are using `jest-worker`:

- [terser-webpack-plugin](https://www.npmjs.com/package/terser-webpack-plugin)
- [rollup-plugin-uglify](https://www.npmjs.com/package/rollup-plugin-uglify)
- [rollup-plugin-terser](https://www.npmjs.com/package/rollup-plugin-terser)
- [eslint-webpack-plugin](https://www.npmjs.com/package/eslint-webpack-plugin)
- [css-minimizer-webpack-plugin](https://www.npmjs.com/package/css-minimizer-webpack-plugin)
- [metro](https://www.npmjs.com/package/metro)

Also jest used on over [6,700,000+ public repositories](https://github.com/facebook/jest/network/dependents).
