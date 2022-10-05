# Unit Tests - Jest - Architecture - 5. The Runtime Environment

The Jest Architecture Series

0. [Jest Full Architecture](./0-architecture-diagram.md)
1. [Jest - Configs](./1-configs.md)
2. [Jest - Dependencies Resolution](./2-dependency-resolutions.md)
3. [Jest - Determine Tests Run Order](./3-determining-how-to-run-tests.md)
4. [Jest - How Tests Run](./4-running-tests.md)
5. **_[Jest - The Runtime Environment](./5-the-runtime-environment.md) 👈 You are here_**
6.

---

![Jest Architecture The Runtime Environment](/img/jest/5-architecture-the-runtime-environment.svg)

## Introduction ✨

Runtime environment is the part that makes jest to work as we expect as jest consumers.

It is in charge of the jest syntax, and know how to read and execute it.

If other parts of jest system like `@jest-sequencer` and `TestScheduler` are in charge to optimize the test run, and they're transparent for us the jest users, as long as we.

The runtime environment part we face when we try to solve failed tests, or debug.
Although it would sound obvious, The runtime environment is what jest is familiar with when we run `jest`.

As I see it, there are 4 main components in the jest runtime environment, `jest-environment`, `jest-runtime`, and `jest-test-framework`. Understanding these will give you a good sense how it works, and that is the focus of the article.

<!-- Generally speaking there are 3 main and very interesting components that compounds the runtime environment.

This article will discuss especially on the "default" runner of jest, the `jest-runner` package and how it works.

Rather than interesting, understanding how jest implemented it can give you a great sense how to use similar patterns in your future solutions. -->

## jest-runner-\*

By default, jest use the `jest-runner` package to run tests.

It receives an array of tests and `options.serial` that determine how the test run should be managed.

```ts
  // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L45-L53
  async runTests(
    tests: Array<Test>,
    watcher: TestWatcher,
    options: TestRunnerOptions,
  ): Promise<void> {
    return options.serial
      ? this.#createInBandTestRun(tests, watcher)
      : this.#createParallelTestRun(tests, watcher);
  }
```

:::note
`runTests(...)` called by the `TestScheduler`, that manage all runners execution, which discussed in detail on the [previous part](./4-running-tests.md) of the series.
:::

As the code tells us, `jest-runner` supports two running methods:

1. Run in parallel (`#createParallelTestRun`) - Manage the test run in multiple processes `jest-runner` establish to run tests in parallel, in this method tests are not running on the process as jest is running.

2. Run in a single process, or "in-band" (`createInBandTestRun`) -
   Run tests on the same process jest is running.

The method is being decide by the caller, who can determine `options.serial` value.

### Run "in-band" (single process) Explained

The tests simply just run in a loop, test by test, when a test completed it is emitting the result with the other parts of the jest system.
On any case here is the [implementation](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L83).

### Run in Parallel Explained

When jest needs to run things in parallel it use the `jest-worker` package, and you pass to worker a path to task file to execute, the `jest-runner` package as a dedicated file written to pass to the worker called [testWorker](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/testWorker.ts#L88) that has the implementation how tests will be run when running by the worker.

```ts
// jest-runner/index.ts
// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L107
async #createParallelTestRun(tests: Array<Test>, watcher: TestWatcher) {
    // ...
    // worker establish
    const worker = new Worker(require.resolve('./testWorker'), {
        exposedMethods: ['worker'], // see how it exposed on "runTestInWorker"
        // ...
        numWorkers: this._globalConfig.maxWorkers,
        // ...,
    }) as WorkerInterface;
    // ...
    // the start time of individual tests.
    const runTestInWorker = (test: Test) =>
        mutex(async () => {
        // ...
        await this.#eventEmitter.emit('test-file-start', [test]);

        // 'worker' exposed from worker
        const promise = worker.worker({ // see .worker(..) implementation below 👇
            config: test.context.config,
            // ...
            path: test.path,
        }) as PromiseWithCustomMessage<TestResult>;

        // ...
        return promise;
    });
    //  ...
    // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L169
    const runAllTests = Promise.all(
        tests.map(test =>
            runTestInWorker(test).then(
                result => this.#eventEmitter.emit('test-file-success', [test, result]),
                error => this.#eventEmitter.emit('test-file-failure', [test, error]),
            ),
        ),
    );
    // ...
    return Promise.race([runAllTests, onInterrupt]).then(cleanup, cleanup);
}
```

```ts
// jest-runner/testWorker.ts
// ...
// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/testWorker.ts#L88-L112
export async function worker({
  config,
  globalConfig,
  path,
  context,
}: WorkerData): Promise<TestResult> {
  try {
    return await runTest(
      path,
      globalConfig,
      config
      // ...
    );
  } catch (error: any) {
    throw formatError(error);
  }
}
```

---

## Running a Test File

No matter which of the running method you choose, the magic happens a test is actually run.

But there are no magic, and in fact that is where the runtime environment really take into place, which is a compound of 3 main components: `jest-environment`, `jest-runtime`, and `jest-test-framework`.

## jest-environment-\* - The Test Environment

The first thing a test file run is doing is to initial the environment.

The code you run with jest can be run on different environments, the most obvious examples are `node` environment or `browser/dom` environment.

If I'll take for instance a frontend application, it assumes that on the global scope there is a `window` object, as long with all other `DOM` objects, without them the code will crash very quickly.

But jest is based on `node` so maybe you thought about it and maybe you didn't - but how exactly jest has all objects a browser code need to run?
The answer for that is `jest-environment`, because when initialize the test environment you should configure jest what environment the code expecting to have, so jest can setup the global scope to have everything your code need to run.

I'll stick with the two obvious examples, which are also official environment developed as part of the jest repository:

1. [jest-environment-node](https://github.com/facebook/jest/tree/main/packages/jest-environment-node) - Initial the global scope to match node environment
2. [jest-environment-jsdom](https://github.com/facebook/jest/tree/main/packages/jest-environment-jsdom) - Uses [jsdom](https://github.com/jsdom/jsdom) and make sure the global scope matches browser's global scope.

:::note

See how the node global object is being overload: <br/>

1. [jest-environment-node](https://github.com/facebook/jest/blob/9ba555ba7af8e49d0eb8cf78f7f50b2fcbfd9ce9/packages/jest-environment-node/src/index.ts#L68-L105)
2. [jest-environment-jsdom](https://github.com/facebook/jest/blob/main/packages/jest-environment-jsdom/src/index.ts#L47-L73)

:::

## jest-runtime - Isolating Test Execution

When the role of `jest-environment-*` is to define the global scope the test includes, the runtime build an isolated environment to ensure that when running one test can not affect another test with the global object defined for that test.

the jest team implemented that isolated environment using the [vm](https://nodejs.org/api/vm.html#vm-executing-javascript) built-in node module that enables to compiling and running code within virtual machine contexts.

It works for running tests both on a single process or in multiple, each test run on its own "vm" context, that keeps it isolated.

Although the `node:vm` is not considered secured, because it is possible to break out of it, when running tests, only trusted code run, which makes this solution very convenient for testing framework.

The "vm" module enables you to customize the node isolated environment global scope to be the one defined during `jest-environment-*`.

While `jest-environment-*` define the global APIs needed like the DOM apis for frontend code, the `jest-runtime` add custom jest implementation to the global scope as well, the most important function it defines is the `require`, that in comparison to a regular environment where `require` means to import a module, for jest the `require` implementation includes the mocking system, that enables to swap out modules at runtime when calling `jest.mock(🤡)` then at runtime the custom implementation figuring out whether the real module should be required or the mock should be required.

```ts
// ### WARNING ###
// The code is hard to understand, the important thing is to understand how it works in a high level.
// ### WARNING ###

// ...
export default class Runtime {
    // ...

    // https://github.com/facebook/jest/blob/main/packages/jest-runtime/src/index.ts#L1386
    private _execModule(
    localModule: InitialModule,
    options: InternalModuleOptions | undefined,
    moduleRegistry: ModuleRegistry,
    from: string | null,
    ) {
        const module = localModule as Module;

        // ...

        // set custom require implementation for module
        Object.defineProperty(module, 'require', {
            value: this._createRequireImplementation(module, options),
        });

        // ...

        let compiledFunction: ModuleWrapper | null = null;

        const script = this.createScriptFromCode(transformedCode, filename);

        let runScript: RunScriptEvalResult | null = null;

        const vmContext = this._environment.getVmContext();

        if (vmContext) {
            // run script in content, and return value
            runScript = script.runInContext(vmContext, {filename});
        }

        if (runScript !== null) {
            compiledFunction = runScript[EVAL_RESULT_VARIABLE];
        }

        // ...

        try {
            // call compiled function with module custom implementations
            compiledFunction.call(
                module.exports,
                module, // module object
                module.exports, // module exports
                module.require, // require implementation
                module.path, // __dirname
                module.filename, // __filename
                lastArgs[0],
                ...lastArgs.slice(1).filter(notEmpty),
            );
        } catch (error: any) {
            // ...
        }
        // ...
    }

// ...

```

## Jest Test Framework

A test framework is responsible to bind the `jest-environment`, the `jest-runtime` together with jest syntax, e.g. `describe(🤡)`, and use it all to run a test and get a `TestResult`.

So if I'll go back to the `jest-runner` you can find how the 3 components combined.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/runTest.ts#L298-L305
// result = TestResult
result = await testFramework(
  globalConfig, // config
  projectConfig, // config
  environment, // jest-environment instance
  runtime, // jest-runtime instance
  path, // test path
  sendMessageToJest
);
```

:::note
If you really interesting to see how the actual test is running over the `describe` and `test` blocks, you can find it [here](https://github.com/facebook/jest/blob/main/packages/jest-circus/src/run.ts).
:::

### A thread how jest globals assign to the jest global context

I took the example from `jest-circus`

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-circus/src/index.ts#L238-L247
export { afterAll, afterEach, beforeAll, beforeEach, describe, it, test };
export default {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  test,
};

// https://github.com/facebook/jest/blob/main/packages/jest-circus/src/legacy-code-todo-rewrite/jestAdapterInit.ts#L24-L89
import globals from '..';

// ...

export const initialize = async ({
  config,
  environment,
  globalConfig,
  localRequire,
  parentProcess,
  sendMessageToJest,
  setGlobalsForRuntime,
  testPath,
}: {
  config: Config.ProjectConfig;
  environment: JestEnvironment;
  globalConfig: Config.GlobalConfig;
  localRequire: <T = unknown>(path: string) => T;
  testPath: string;
  parentProcess: NodeJS.Process;
  sendMessageToJest?: TestFileEvent;
  setGlobalsForRuntime: (globals: RuntimeGlobals) => void;
}) => {
  // ...

  const globalsObject: Global.TestFrameworkGlobals = {
    ...globals,
    fdescribe: globals.describe.only,
    fit: globals.it.only,
    xdescribe: globals.describe.skip,
    xit: globals.it.skip,
    xtest: globals.it.skip,
  };

  // ...

  const runtimeGlobals: RuntimeGlobals = {
    ...globalsObject,
    expect: jestExpect,
  };
  setGlobalsForRuntime(runtimeGlobals);

  // ...
};

// ...

// https://github.com/facebook/jest/blob/main/packages/jest-runtime/src/index.ts#L2306
setGlobalsForRuntime(globals: JestGlobals): void {
    this.jestGlobals = globals;
}
```

### The History of Jest Test Frameworks

When jest first released, the `jest-runner` worked with `jasmine` under-the-hood, the jest team found it too heavy because jest doesn't use every ability `jasmine` supports, so they forked `jasmine`, stripped out redundant parts and created a lighter package call `jest-jasmine2` which still in use as these lines were written.

But at the same time the jest team worked on building `jest-jasmine2`, they worked on a next-gen test framework name `jest-circus` that is inspired by flux, meaning it manages a state and dispatch it for modifications and according to them should be faster.

<div align="center">
<div style={{ 
display: "inline-flex", 
flexDirection: "column", 
alignItems: "center",
padding: "0 10px"
}}>
<img src="/img/jest/jasmine.svg" alt="Jasmine" width="50" style={{ }} />
    <p>Jasmine</p>
</div>

<div style={{ 
display: "inline-flex", 
flexDirection: "column", 
alignItems: "center",
padding: "0 10px"
}}>
    <img src="/img/jest/jest-circus.png" alt="Circus" width="50" />
    <p>Circus</p>
</div>
</div>

:::note
As of Jest 27, `jest-circus` is the default test runner, so you do not have to install it to use it.
:::

When the `jest-runner` initialize the test framework it passes it both the `jest-environment` configured for that test the the `jest-runtime` instance.

See some code highlights 🤩

```ts
// ...
async function runTestInternal(
  path: string,
  globalConfig: Config.GlobalConfig,
  projectConfig: Config.ProjectConfig,
  resolver: Resolver,
  context: TestRunnerContext,
  sendMessageToJest?: TestFileEvent
): Promise<RunTestInternalResult> {
  // ...
  // result: TestResult
  // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/runTest.ts#L288-L295
  result = await testFramework(
    globalConfig,
    projectConfig,
    environment,
    runtime,
    path,
    sendMessageToJest
  );
  // ...
  return new Promise((resolve) => {
    setImmediate(() => resolve({ leakDetector, result }));
  });
}
// ...
```

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/types.ts#L90-L122
export type TestResult = {
  console?: ConsoleBuffer;
  coverage?: CoverageMapData;
  displayName?: Config.DisplayName;
  failureMessage?: string | null;
  leaks: boolean;
  memoryUsage?: number;
  numFailingTests: number;
  numPassingTests: number;
  numPendingTests: number;
  numTodoTests: number;
  openHandles: Array<Error>;
  perfStats: {
    end: number;
    runtime: number;
    slow: boolean;
    start: number;
  };
  skipped: boolean;
  snapshot: {
    added: number;
    fileDeleted: boolean;
    matched: number;
    unchecked: number;
    uncheckedKeys: Array<string>;
    unmatched: number;
    updated: number;
  };
  testExecError?: SerializableError;
  testFilePath: string;
  testResults: Array<AssertionResult>;
  v8Coverage?: V8CoverageResult;
};
```

## Outroduction 👋

There is still one major and very interesting that happens during the runtime environment, and I'm talking about
modules transformation, but I decided to give it its own chapter.

The code on the runtime environment is really complex and advance, and I'm sure that I might not cover some important parts of it, but I cover the major components involved as I see it and also the parts that covered over the Jest Architecture Video.
