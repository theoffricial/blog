# Part 5. The Runtime Environment 💽

import PageStarter from '@site/src/components/PageStarter';

<PageStarter />

## Introduction ✨

If you have read [Part 4. Test Run](./4-test-run.md), you probably have read about the different interactions between
the `TestScheduler` that initial and orchestrates all runners, and the runners themselves.

Well this article is about the default `jest-runner` and the major things it does to actually run tests.

Here are `jest-runner` major responsibilities in high-level:

1. Setup the environment that the tests should operate in, which known as `jest-environment`
2. Setup and manage an isolated environment that verifies tests does not affect each other. known as `jest-runtime`
3. Setup and run the test framework `jest-runner` is using to actually supports jest globals and syntax, that also tear down the jest syntax and run tests. known as `test framework`.

## Part 5. The Runtime Environment Diagram ✍️

import JestArchitectureSVG from './5-jest-architecture-the-runtime-environment.svg';

<JestArchitectureSVG />

## 1 - Following The Run Method - "In-Band" Or In-Parallel (passed by `TestScheduler`)

First, the default `jest-runner` is an emitter runner, that is why it doesn't receive and callbacks (on the previous part, I introduced you that jest supports callback runners as well.).

The `TestScheduler` call the `jest-runner` `runTests(..)` function that receiving an `options` argument that has a `serial` property, and simply just following its value.

```ts
export default class TestRunner extends EmittingTestRunner {
  // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L45-L53
  async runTests(
    tests: Array<Test>,
    watcher: TestWatcher,
    options: TestRunnerOptions
  ): Promise<void> {
    return options.serial
      ? // "in-band"
        this.#createInBandTestRun(tests, watcher)
      : // in parallel
        this.#createParallelTestRun(tests, watcher);
  }
  // ...
}
```

### Run "in-band" Implementation

"in-band" means to run tests synchronously, one by one.

#### Run "in-band" method - Code Highlights 🔦

```ts
export default class TestRunner extends EmittingTestRunner {
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L55
  async #createInBandTestRun(tests: Array<Test>, watcher: TestWatcher) {
    process.env.JEST_WORKER_ID = '1';
    // limit concurrency to 1 process
    const mutex = pLimit(1);
    // run tests in loop
    return tests.reduce(
      (promise, test) =>
        mutex(() =>
          promise
            .then(async () => {
              // ...

              // Helper function to emit events back to "TestScheduler"
              // `deepCyclicCopy` used here to avoid mem-leak
              const sendMessageToJest: TestFileEvent = (eventName, args) =>
                this.#eventEmitter.emit(
                  eventName,
                  deepCyclicCopy(args, { keepPrototype: false })
                );

              await this.#eventEmitter.emit('test-file-start', [test]);

              return runTest(
                test.path,
                this._globalConfig,
                test.context.config,
                test.context.resolver,
                this._context,
                sendMessageToJest
              );
            })
            .then(
              (result) =>
                this.#eventEmitter.emit('test-file-success', [test, result]),
              (error) =>
                this.#eventEmitter.emit('test-file-failure', [test, error])
            )
        ),
      Promise.resolve()
    );
  }
  // ...
}
```

### Run in Parallel Implementation

When jest requires to run tasks in parallel, it calls `jest-worker`.

You can read more how exactly the `jest-worker` package works on the series **[Appendix Ⅱ: jest-worker 👷](./appendix-2-jest-worker.md)**.

In high-level `jest-runner` pass to `jest-worker`:

1. On worker initial pass the `maxWorkers` option
2. A test file path
3. Test config

When jest needs to run things in parallel it use the `jest-worker` package, and you pass to worker a path to task file to execute, the `jest-runner` package as a dedicated file written to pass to the worker called [testWorker](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/testWorker.ts#L88) that has the implementation how tests will be run when running by the worker.

#### Run in Parallel Implementation - Code Highlights 🔦

```ts
// packages/jest-runner/index.ts

export default class TestRunner extends EmittingTestRunner {
  // ...

  // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L96
  async #createParallelTestRun(tests: Array<Test>, watcher: TestWatcher) {
    // ...

    // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L107
    // Initial worker
    const worker = new Worker(require.resolve('./testWorker'), {
      exposedMethods: ['worker'], // What methods to expose from the "testWorker" file/module.
      // ...
      numWorkers: this._globalConfig.maxWorkers, // max processes to spawn
      // ...,
    }) as WorkerInterface;

    // ...

    // Limit concurrency to "maxWorkers" option
    const mutex = pLimit(this._globalConfig.maxWorkers);

    // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L128
    // Send test suites to workers continuously instead of all at once to track
    // the start time of individual tests.
    const runTestInWorker = (test: Test) =>
      mutex(async () => {
        // ...

        // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L134
        // Emit that test start its run
        await this.#eventEmitter.emit('test-file-start', [test]);

        // call the "worker" method exposed from the worker above.
        // The worker implementation is below
        const promise = worker.worker({
          config: test.context.config,
          context: {
            // ...
          },
          globalConfig: this._globalConfig,
          path: test.path,
        }) as PromiseWithCustomMessage<TestResult>;

        // ...
        return promise;
      });

    //  ...

    // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L169
    const runAllTests = Promise.all(
      tests.map((test) =>
        runTestInWorker(test).then(
          (result) =>
            // success event
            this.#eventEmitter.emit('test-file-success', [test, result]),
          // failure event
          (error) => this.#eventEmitter.emit('test-file-failure', [test, error])
        )
      )
    );

    // clean up worker processes
    const cleanup = async () => {
      const { forceExited } = await worker.end();
      if (forceExited) {
        console.error(
          chalk.yellow(
            'A worker process has failed to exit gracefully and has been force exited. ' +
              'This is likely caused by tests leaking due to improper teardown. ' +
              'Try running with --detectOpenHandles to find leaks. ' +
              'Active timers can also cause this, ensure that .unref() was called on them.'
          )
        );
      }
    };

    return Promise.race([runAllTests, onInterrupt]).then(cleanup, cleanup);
  }

  // ...
}
```

```ts
// packages/jest-runner/testWorker.ts

// ...

// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/testWorker.ts#L88-L112
export async function worker({
  config,
  globalConfig,
  path,
  context,
}: WorkerData): Promise<TestResult> {
  try {
    // running a single test
    return await runTest(
      path, // test path
      globalConfig,
      config // project config
      getResolver(config),
      context,
      sendMessageToJest, // helper for event emitting
    );
  } catch (error: any) {
    throw formatError(error);
  }
}
```

---

After understand how running methods work, let's break down how `jest-runner` is actually running a single test file.

## 2 - Setup `jest-environment-*` - The Test Environment

> The test environment that will be used for testing. The default environment in Jest is a Node.js environment.
> If you are building a web app, you can use a browser-like environment through jsdom instead.
> _Jest Docs_

jest also support custom environment, but personally I never used it, but there is some explanation about it in their [docs](https://jestjs.io/docs/configuration#testenvironment-string).

Let's think about it, If you write react code, it depends on having objects like the global `window` other `DOM` objects and functions, otherwise the code will crash pretty fast. While nodejs code depends on entirely different globals.

So jest makes sure that a test has the environment it needs to run successfully.

:::note
You can custom environment by using the **[testEnvironment](https://jestjs.io/docs/configuration#testenvironment-string)** option.
The test environment also allows custom options using the **[testEnvironmentOptions](https://jestjs.io/docs/configuration#testenvironmentoptions-object)** option.
:::

### `jest-environment-*` - Code Highlights 🔦

#### `jest-environment-node`:

```ts
// packages/jest-environment-node/src/index.ts

// https://github.com/facebook/jest/blob/main/packages/jest-environment-node/src/index.ts#L37
const nodeGlobals = new Map(
  Object.getOwnPropertyNames(globalThis)
    .filter((global) => !denyList.has(global))
    .map((nodeGlobalsKey) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        nodeGlobalsKey
      );

      if (!descriptor) {
        throw new Error(
          `No property descriptor for ${nodeGlobalsKey}, this is a bug in Jest.`
        );
      }

      return [nodeGlobalsKey, descriptor];
    })
);

// ...

export default class NodeEnvironment implements JestEnvironment<Timer> {
  // ...

  // https://github.com/facebook/jest/blob/main/packages/jest-environment-node/src/index.ts#L69
  //  while `context` is unused, it should always be passed
  constructor(config: JestEnvironmentConfig, _context: EnvironmentContext) {
    const { projectConfig } = config;
    this.context = createContext();
    const global = runInContext(
      'this',
      Object.assign(this.context, projectConfig.testEnvironmentOptions)
    ) as Global.Global;
    this.global = global;

    const contextGlobals = new Set(Object.getOwnPropertyNames(global));
    for (const [nodeGlobalsKey, descriptor] of nodeGlobals) {
      if (!contextGlobals.has(nodeGlobalsKey)) {
        Object.defineProperty(global, nodeGlobalsKey, {
          configurable: descriptor.configurable,
          enumerable: descriptor.enumerable,
          get() {
            // @ts-expect-error: no index signature
            const val = globalThis[nodeGlobalsKey] as unknown;

            // override lazy getter
            Object.defineProperty(global, nodeGlobalsKey, {
              configurable: descriptor.configurable,
              enumerable: descriptor.enumerable,
              value: val,
              writable: descriptor.writable,
            });
            return val;
          },
          set(val: unknown) {
            // override lazy getter
            Object.defineProperty(global, nodeGlobalsKey, {
              configurable: descriptor.configurable,
              enumerable: descriptor.enumerable,
              value: val,
              writable: true,
            });
          },
        });
      }
    }

    // @ts-expect-error - Buffer and gc is "missing"
    global.global = global;
    global.Buffer = Buffer;
    global.ArrayBuffer = ArrayBuffer;
    // TextEncoder (global or via 'util') references a Uint8Array constructor
    // different than the global one used by users in tests. This makes sure the
    // same constructor is referenced by both.
    global.Uint8Array = Uint8Array;

    installCommonGlobals(global, projectConfig.globals);

    // Node's error-message stack size is limited at 10, but it's pretty useful
    // to see more than that when a test fails.
    global.Error.stackTraceLimit = 100;

    // ...
  }
}
```

#### `jest-environment-jsdom`:

the `jest-environment-jsdom` uses the [jsdom](https://github.com/jsdom/jsdom) package to run browser code over nodejs.

> jsdom is a pure-JavaScript implementation of many web standards, notably the WHATWG [DOM](https://dom.spec.whatwg.org) and [HTML](https://html.spec.whatwg.org/multipage) Standards, for use with Node.js.
> In general, the goal of the project is to emulate enough of a subset of a web browser to be useful for testing and scraping real-world web applications.
>
> **_jsdom GitHub README.md_**

---

```ts
export default class JSDOMEnvironment implements JestEnvironment<number> {
  // ...

  // https://github.com/facebook/jest/blob/main/packages/jest-environment-jsdom/src/index.ts#L42-L147
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    const { projectConfig } = config;

    // ...

    this.dom = new JSDOM(
      typeof projectConfig.testEnvironmentOptions.html === 'string'
        ? projectConfig.testEnvironmentOptions.html
        : '<!DOCTYPE html>',
      {
        pretendToBeVisual: true,
        resources:
          typeof projectConfig.testEnvironmentOptions.userAgent === 'string'
            ? new ResourceLoader({
                userAgent: projectConfig.testEnvironmentOptions.userAgent,
              })
            : undefined,
        runScripts: 'dangerously',
        url: 'http://localhost/',
        virtualConsole,
        ...projectConfig.testEnvironmentOptions,
      }
    );

    const global = (this.global = this.dom.window.document
      .defaultView as unknown as Win);

    if (global == null) {
      throw new Error('JSDOM did not return a Window object');
    }

    // ...
    installCommonGlobals(global, projectConfig.globals);

    // ...
  }

  // ...
}
```

## 3 - The Run Time Context - `jest-runtime`

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

## jest-runner Implementation - Code Highlights 🔦

The implementation is long, so I added it here, as a separate section.
Take a look after you understand the main concepts of how the different components works!

```ts
// jest-runner/src/runTest.ts

// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/runTest.ts#L375-L403
// This function call from the jest-runner/src/index.ts
export default async function runTest(
  path: string,
  globalConfig: Config.GlobalConfig,
  config: Config.ProjectConfig,
  resolver: Resolver,
  context: TestRunnerContext,
  sendMessageToJest?: TestFileEvent
): Promise<TestResult> {
  const { leakDetector, result } = await runTestInternal(
    path,
    globalConfig,
    config,
    resolver,
    context,
    sendMessageToJest
  );

  if (leakDetector) {
    // We wanna allow a tiny but time to pass to allow last-minute cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Resolve leak detector, outside the "runTestInternal" closure.
    result.leaks = await leakDetector.isLeaking();
  } else {
    result.leaks = false;
  }

  return result;
}

// Keeping the core of "runTest" as a separate function (as "runTestInternal")
// is key to be able to detect memory leaks. Since all variables are local to
// the function, when "runTestInternal" finishes its execution, they can all be
// freed, UNLESS something else is leaking them (and that's why we can detect
// the leak!).
//
// If we had all the code in a single function, we should manually nullify all
// references to verify if there is a leak, which is not maintainable and error
// prone. That's why "runTestInternal" CANNOT be inlined inside "runTest".
// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/runTest.ts#L77-L373
async function runTestInternal(
  path: string,
  globalConfig: Config.GlobalConfig,
  projectConfig: Config.ProjectConfig,
  resolver: Resolver,
  context: TestRunnerContext,
  sendMessageToJest?: TestFileEvent
): Promise<RunTestInternalResult> {
  // read file
  const testSource = fs.readFileSync(path, 'utf8');
  // extract docblocks
  const docblockPragmas = docblock.parse(docblock.extract(testSource));
  // look if "jest-environment" specified in docblock
  const customEnvironment = docblockPragmas['jest-environment'];

  // Assign test environment to "testEnvironment" option
  let testEnvironment = projectConfig.testEnvironment;

  // Check if a custom environment has specified through docblock
  if (customEnvironment) {
    if (Array.isArray(customEnvironment)) {
      throw new Error(
        `You can only define a single test environment through docblocks, got "${customEnvironment.join(
          ', '
        )}"`
      );
    }

    // resolve environment file path
    testEnvironment = resolveTestEnvironment({
      ...projectConfig,
      requireResolveFunction: require.resolve,
      testEnvironment: customEnvironment,
    });
  }

  const cacheFS = new Map([[path, testSource]]);
  const transformer = await createScriptTransformer(projectConfig, cacheFS);

  // require and transpile environment which is an "export default class"
  const TestEnvironment: typeof JestEnvironment =
    await transformer.requireAndTranspileModule(testEnvironment);

  // require and transpile test framework
  const testFramework: TestFramework =
    await transformer.requireAndTranspileModule(
      process.env.JEST_JASMINE === '1'
        ? require.resolve('jest-jasmine2')
        : projectConfig.testRunner
    );

  // require and transpile runtime environment which is an "export default class"
  const Runtime: typeof RuntimeClass = interopRequireDefault(
    projectConfig.runtime
      ? require(projectConfig.runtime)
      : require('jest-runtime')
  ).default;

  // ...

  // Check if environment from docblock has custom options
  const docblockEnvironmentOptions =
    docblockPragmas['jest-environment-options'];

  // if it has, parse them
  if (typeof docblockEnvironmentOptions === 'string') {
    extraTestEnvironmentOptions = JSON.parse(docblockEnvironmentOptions);
  }

  // Initial test environment, with configs, console implementation, test path
  const environment = new TestEnvironment(
    {
      globalConfig,
      projectConfig: extraTestEnvironmentOptions
        ? {
            ...projectConfig,
            testEnvironmentOptions: {
              ...projectConfig.testEnvironmentOptions,
              ...extraTestEnvironmentOptions,
            },
          }
        : projectConfig,
    },
    {
      console: testConsole,
      docblockPragmas,
      testPath: path,
    }
  );

  // ...

  const runtime = new Runtime(
    projectConfig,
    environment,
    resolver,
    transformer,
    cacheFS,
    {
      // changed files to re-transform
      changedFiles: context.changedFiles,
      // coverage options
      collectCoverage: globalConfig.collectCoverage,
      collectCoverageFrom: globalConfig.collectCoverageFrom,
      coverageProvider: globalConfig.coverageProvider,
      sourcesRelatedToTestsInChangedFiles:
        context.sourcesRelatedToTestsInChangedFiles,
    },
    path, // test path
    globalConfig
  );

  // ...

  try {
    // setup "hook" if necessary
    await environment.setup();

    let result: TestResult;

    try {
      // collect coverage
      if (collectV8Coverage) {
        await runtime.collectV8Coverage();
      }

      // start test framework run
      // and getting test result in return
      result = await testFramework(
        globalConfig,
        projectConfig,
        environment, // pass environment
        runtime, // pass runtime
        path,
        sendMessageToJest
      );
    } catch (err: any) {
      // Access stack before uninstalling sourcemaps
      err.stack;

      throw err;
    } finally {
      if (collectV8Coverage) {
        await runtime.stopCollectingV8Coverage();
      }
    }

    // ...

    // tear down environment
    await tearDownEnv();

    // Delay the resolution to allow log messages to be output.
    return await new Promise((resolve) => {
      setImmediate(() => resolve({ leakDetector, result }));
    });
  } finally {
    // tear down environment
    await tearDownEnv();

    // ...
  }
}
```

## Outroduction 👋

There is still one major and very interesting that happens during the runtime environment, and I'm talking about
modules transformation, but I decided to give it its own chapter.

The code on the runtime environment is really complex and advance, and I'm sure that I might not cover some important parts of it, but I cover the major components involved as I see it and also the parts that covered over the Jest Architecture Video.
