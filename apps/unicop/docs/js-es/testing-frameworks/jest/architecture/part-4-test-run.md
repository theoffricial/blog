---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 11/25/2022
  author: Ofri Peretz
---

# Part 4. Test Run 🃏

## Introduction ✨

After figuring out configuration, file list & dependency graph, finding tests, and determining their run order, Jest can schedule tests to run.

For this Jest has a module call the `TestScheduler`, that currently isn't a standalone package, but part of `@jest/core`.

The `TestScheduler` main job is to schedule "runners", and manage them as long as they run.

<!-- Let's break down the steps one by one to find out how jest manages the test run.

:::note
This article concentrate on how the test run being manages and how the main components communicate with each other.
The next article **[Part 5. The Runtime Environment](./part-5-the-runtime-environment.md)** focused on the detail how jest is actually taking a test file and running it.
::: -->

## Part 4. Test Run Diagram ✍️

import JestArchitectureSVG from './svg/part-4-test-run.svg';

<JestArchitectureSVG />

## `TestScheduler` Run Method - "In-Band" Or In-Parallel

First, The `TestScheduler` determine the execution method it runs, and it supports 2 options:

1. Running "in-band" - run all tests on a single process, on the same process jest is running, one after one in a synchronous sequence.
2. Running parallelize - Schedule a great amount of work processes and then schedule tests to run over them, and get back their results asynchronously.

By default Jest chooses the "parallelize" execution, So if you want to run tests "in-band", you have to explicitly set it, which you can do by using the `--runInBand` option.

Although it's default, for each test run the `TestScheduler` runs an heuristic, which I call the `shouldRunInBand` heuristic, which tries to predict how long the entire test run will take,
When `TestScheduler` finds a project relatively small, it will decide to run the tests "in-band", because establishing [jest-worker](./appendix-2-jest-worker.md)-s is an expensive action and it will probably be faster to just run them, in stead of spawning multiple processes and then run all tests in parallel.

That's why small projects usually run "in-band", because of the `shouldRunInBand` heuristic. Jest added the heuristic increase user experience for small projects.
Also worth mention that for Jest to use the `shouldRunInBand` heuristic, It has to have cache available (for the duration metadata), meaning not on first run.

Whatever the `TestScheduler` decides, it will send it to the `jest-runner` module, in which describes at the next part [The Runtime Environment 💽](./part-5-the-runtime-environment.md).

### The `shouldRunInBand` Heuristic Example

If a project has 10 tests, and running them takes up to 5 seconds.
For such case, it doesn't make sense to spawn 10 new processes that their start-up time probably be longer than the time it takes to actually run those tests.

That's why `TestScheduler` consider what might be the best running method for that project, running all tests immediately on the same process jest is running or spawn processes and run them in parallel.

This consideration of the `TestScheduler` call in jest code the `shouldRunInBand` heuristic, and it created mostly to improve user experience while project are relatively small (because large projects will always pick the parallel option if "in-band" not explicitly specified).

### `TestScheduler` Run Method: See Jest Implementation Highlights 🔦

```ts
// jest-core/src/TestScheduler.ts
class TestScheduler {
  // ...
  async scheduleTests(
    tests: Array<Test>,
    watcher: TestWatcher
  ): Promise<AggregatedResult> {
    // ...
    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L112
    const runInBand = shouldRunInBand(tests, timings, this._globalConfig);
    // ...
    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L244
    // jest-runner / custom-runner options
    const testRunnerOptions = {
      // Should runner run tests in serial or in parallel
      serial: runInBand || Boolean(testRunner.isSerial),
    };
    // ...
  }
}

// ######################################################################

// jest-core/src/testSchedulerHelper.ts

// https://github.com/facebook/jest/blob/main/packages/jest-core/src/testSchedulerHelper.ts#L13-L48
export function shouldRunInBand(
  tests: Array<Test>,
  timings: Array<number>,
  { detectOpenHandles, maxWorkers, watch, watchAll }: Config.GlobalConfig
): boolean {
  // detectOpenHandles makes no sense without runInBand, because it cannot detect leaks in workers
  if (detectOpenHandles) {
    return true;
  }

  /*
   * Run in band if we only have one test or one worker available, unless we
   * are using the watch mode, in which case the TTY has to be responsive and
   * we cannot schedule anything in the main thread. Same logic applies to
   * watchAll.
   * Also, if we are confident from previous runs that the tests will finish
   * quickly we also run in band to reduce the overhead of spawning workers.
   * Finally, the user can provide the runInBand argument in the CLI to
   * force running in band.
   * https://github.com/facebook/jest/blob/main/packages/jest-config/src/getMaxWorkers.js#L14-L17
   */
  const isWatchMode = watch || watchAll;
  const areFastTests = timings.every((timing) => timing < SLOW_TEST_TIME);
  const oneWorkerOrLess = maxWorkers <= 1;
  const oneTestOrLess = tests.length <= 1;

  if (isWatchMode) {
    return oneWorkerOrLess || (oneTestOrLess && areFastTests);
  }

  return (
    oneWorkerOrLess ||
    oneTestOrLess ||
    (tests.length <= 20 && timings.length > 0 && areFastTests)
  );
}
```

## How `TestScheduler` Communicates with Runners

The `TestScheduler` is the test run orchestrator, and responsible for initialing test runners, scheduling test runners, and building communication channels between runners and [reporters](./appendix-4-reporters.md) dispatcher.

:::note

In Jest, Runners are the component that actually executes tests.
Runners are explained on the next part, [The Runtime Environment 💽](./part-5-the-runtime-environment.md).
By default, Jest runner is an instance of the `jest-runner` module.

:::

The `TestScheduler` supports 2 communication methods with runners it initialize:

1. Callback Runners - that receive callback functions as arguments, and call them when results are ready.
2. Emitter Runners - For this type of runners, the `TestScheduler` establish listeners for known events, and waiting for runners to emit results.

Both methods enable the `TestScheduler` receiving results asynchronously.

:::note

The way communication is being implemented between `TestScheduler` module and the "test" runners, Jest enables us to develop custom "test" runners for different types of jobs and execute those tasks smoothly using Jest and its advanced parallelize system.

The default runner that comes out-of-the-box is the `jest-runner` package, that its job is to run tests as we expect jest to do.
But the community have already developed custom runners to leverage jest and its optimize mechanisms as a legitimate runner for various tasks.

Community custom runners exists, and are ready for you to use. For example, [jest-runner-eslint](https://github.com/jest-community/jest-runner-eslint) that leverages Jest to execute `eslint` over your "test files", which can be configure to be your entire code base. <br />
That's SUPER cool.
:::

### How `TestScheduler` Communicates with Runners: See Jest Implementation Highlights 🔦

#### Callback "Test" Runner Contracts:

```ts
// packages/jest-runner/src/types.ts

// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/types.ts#L22-L32

// Callback signatures
export type OnTestStart = (test: Test) => Promise<void>;

export type OnTestFailure = (
  test: Test,
  serializableError: SerializableError
) => Promise<void>;

export type OnTestSuccess = (
  test: Test,
  testResult: TestResult
) => Promise<void>;

// ...

// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/types.ts#L100-114
// Runner that communicates by callback functions
export abstract class CallbackTestRunner
  extends BaseTestRunner
  implements CallbackTestRunnerInterface
{
  readonly supportsEventEmitters = false;

  abstract runTests(
    tests: Array<Test>,
    watcher: TestWatcher,
    onStart: OnTestStart,
    onResult: OnTestSuccess,
    onFailure: OnTestFailure,
    options: TestRunnerOptions
  ): Promise<void>;
}
```

#### Emitter "Test" Runner Contracts:

```ts
// packages/jest-test-result/src/types.ts

// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/types.ts#L195-L201
// Typings for `sendMessageToJest` events
export type TestEvents = {
  'test-file-start': [Test];
  'test-file-success': [Test, TestResult];
  'test-file-failure': [Test, SerializableError];
  'test-case-result': [string, AssertionResult];
};
```

```ts
// packages/jest-runner/src/types.ts

// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/types.ts#L116-132
// Runner that communicates by emitting events
export abstract class EmittingTestRunner
  extends BaseTestRunner
  implements EmittingTestRunnerInterface
{
  readonly supportsEventEmitters = true;

  abstract runTests(
    tests: Array<Test>,
    watcher: TestWatcher,
    options: TestRunnerOptions
  ): Promise<void>;

  abstract on<Name extends keyof TestEvents>(
    eventName: Name,
    listener: (eventData: TestEvents[Name]) => void | Promise<void>
  ): UnsubscribeFn;
}
```

#### `TestScheduler` Contracts Implementation:

```ts
// packages/jest-core/src/TestScheduler.ts

// https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L51-L54
// The interface TestScheduler expect the runner it schedules will follow
type TestRunnerConstructor = new (
  globalConfig: Config.GlobalConfig,
  testRunnerContext: TestRunnerContext
) => JestTestRunner;

class TestScheduler {
  async scheduleTests(
    tests: Array<Test>,
    watcher: TestWatcher
  ): Promise<AggregatedResult> {
    // ...

    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L219-L225
    const Runner: TestRunnerConstructor =
      await transformer.requireAndTranspileModule(config.runner);

    // initializing a new runner
    const runner = new Runner(this._globalConfig, {
      changedFiles: this._context.changedFiles,
      sourcesRelatedToTestsInChangedFiles:
        this._context.sourcesRelatedToTestsInChangedFiles,
    });

    // ...
    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L248
    if (testRunner.supportsEventEmitters) {
      // Runners that supports events - like the default `jest-runner`
      const unsubscribes = [
        // Initialize the 4 events "TestScheduler" supports: start,success,fail,completed
        testRunner.on('test-file-start', ([test]) => onTestFileStart(test)),
        testRunner.on('test-file-success', ([test, testResult]) =>
          onResult(test, testResult)
        ),
        testRunner.on('test-file-failure', ([test, error]) =>
          onFailure(test, error)
        ),
        testRunner.on('test-case-result', ([testPath, testCaseResult]) => {
          const test: Test = { context, path: testPath };
          this._dispatcher.onTestCaseResult(test, testCaseResult);
        }),
      ];

      await testRunner.runTests(tests, watcher, testRunnerOptions);

      unsubscribes.forEach((sub) => sub());
    } else {
      // Otherwise, Infer runner based on callbacks
      await testRunner.runTests(
        tests,
        watcher,
        onTestFileStart,
        onResult,
        onFailure,
        testRunnerOptions
      );
    }
  }
}
```

:::note

1. A drill down into how the `jest-runner` package works can be found on the next part **[Part 5. The Runtime Environment 💽](./part-5-the-runtime-environment.md)**.

2. The default `jest-runner` is event based.

:::

## How `TestScheduler` Schedules Test Runners Execution

The `TestScheduler` most obvious job, is scheduling test runners to run tests and return test results.
Based on the run method, and number of projects Jest manages in a single test run, it determines how many runners to schedule.
For Every project it schedules a single test runners.

<!-- The main job of the `TestScheduler` is to setup runners and execute them with proper configuration, including what tests to run, with what context information, and should it run on the same process or in parallel in multiple processes. -->

## How `TestScheduler` Handles Incoming `TestResult`s

The `TestScheduler` handles runners' incoming `TestResult`s, and whenever it receives them it:

1. Aggregates the asynchronous incoming `TestResult`s.
2. Dispatches every incoming `TestResult` to [reporters](./appendix-4-reporters.md).
3. Wait for all tests to complete
4. Returns an aggregated test results object.

### How `TestScheduler` Handles Incoming `TestResult`s - Code Highlights 🔦

:::note
You can see on the **[`TestScheduler` Contracts Implementation](#testscheduler-contracts-implementation)**
How the `TestScheduler` call the same callback it defined on both callbacks, and emitter runners.
:::

```ts
class TestScheduler {
  // ...
  async scheduleTests(
    tests: Array<Test>,
    watcher: TestWatcher
  ): Promise<AggregatedResult> {
    // What "TestScheduler" call on test start
    const onTestFileStart = this._dispatcher.onTestFileStart.bind(
      this._dispatcher
    );
    // ...
    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L114
    // What "TestScheduler" call on success
    const onResult = async (test: Test, testResult: TestResult) => {
      // ...

      // when test file has no tests
      if (testResult.testResults.length === 0) {
        const message = 'Your test suite must contain at least one test.';

        return onFailure(test, {
          message,
          stack: new Error(message).stack,
        });
      }

      // Throws when the context is leaked after executing a test.
      if (testResult.leaks) {
        const message =
          `${chalk.red.bold(
            'EXPERIMENTAL FEATURE!\n'
          )}Your test suite is leaking memory. Please ensure all references are cleaned.\n` +
          '\n' +
          'There is a number of things that can leak memory:\n' +
          '  - Async operations that have not finished (e.g. fs.readFile).\n' +
          '  - Timers not properly mocked (e.g. setInterval, setTimeout).\n' +
          '  - Keeping references to the global scope.';

        return onFailure(test, {
          message,
          stack: new Error(message).stack,
        });
      }

      // Add the incoming result to the aggregated object
      addResult(aggregatedResults, testResult);
      // dispatch reporters
      await this._dispatcher.onTestFileResult(
        test,
        testResult,
        aggregatedResults
      );
      // ...
    };

    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L155
    // What "TestScheduler" call on failure
    const onFailure = async (test: Test, error: SerializableError) => {
      // ...

      // build test result from failure response
      const testResult = buildFailureTestResult(test.path, error);
      testResult.failureMessage = formatExecError(
        testResult.testExecError,
        test.context.config,
        this._globalConfig,
        test.path
      );

      // add failure result
      addResult(aggregatedResults, testResult);

      // dispatch reporters
      await this._dispatcher.onTestFileResult(
        test,
        testResult,
        aggregatedResults
      );
    };
    // ...
    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L248
    // On both methods the `scheduleTests` method is waiting for "runTests" to fully complete.
    if (testRunner.supportsEventEmitters) {
      // ...
      // on emitter runner
      await testRunner.runTests(tests, watcher, testRunnerOptions);
      // ...
    } else {
      // on callback runner
      await testRunner.runTests(
        tests,
        watcher,
        onTestFileStart,
        onResult,
        onFailure,
        testRunnerOptions
      );
    }

    // ...
    aggregatedResults.success = !(
      anyTestFailures ||
      aggregatedResults.snapshot.failure ||
      anyReporterErrors
    );

    return aggregatedResults;
  }
}
```

## What `TestScheduler` Returns

As mentioned above, while waiting for all runners to complete the `TestScheduler` aggregates all incoming test results to an object that implements the `AggregatedTestResult` interface. The aggregated object summaries all test results and returns this object to its caller.
In Jest, the `runJest(..)` function which is part of the `@jest/core` package calls the `TestScheduler` to schedule tests, and after it receives the aggregated object, the `runJest(..)` logic sends it back to the `@jest/test-sequencer` instance that stores it in cache.
The test results, which includes execution duration will be used to optimize future test runs.

### What `TestScheduler` Returns - Code Highlight 🔦

```ts
// packages/jest-test-result/src/types.ts

// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/types.ts#L90-L122
// How test result looks like
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

// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/types.ts#L54-L76
// Aggregated object interface
export type AggregatedResultWithoutCoverage = {
  numFailedTests: number;
  numFailedTestSuites: number;
  numPassedTests: number;
  numPassedTestSuites: number;
  numPendingTests: number;
  numTodoTests: number;
  numPendingTestSuites: number;
  numRuntimeErrorTestSuites: number;
  numTotalTests: number;
  numTotalTestSuites: number;
  openHandles: Array<Error>;
  snapshot: SnapshotSummary;
  startTime: number;
  success: boolean;
  testResults: Array<TestResult>;
  wasInterrupted: boolean;
  runExecError?: SerializableError;
};

export type AggregatedResult = AggregatedResultWithoutCoverage & {
  coverageMap?: CoverageMap | null;
};
```

```ts
// @jest/test-results

// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/helpers.ts

import type { AggregatedResult, SerializableError, TestResult } from './types';

// Initial aggregated test result object
export const makeEmptyAggregatedTestResult = (): AggregatedResult => ({
  numFailedTestSuites: 0,
  numFailedTests: 0,
  numPassedTestSuites: 0,
  numPassedTests: 0,
  numPendingTestSuites: 0,
  numPendingTests: 0,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: 0,
  numTotalTests: 0,
  openHandles: [],
  snapshot: {
    added: 0,
    didUpdate: false, // is set only after the full run
    failure: false,
    filesAdded: 0,
    // combines individual test results + removed files after the full run
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0,
  },
  startTime: 0,
  success: true,
  testResults: [],
  wasInterrupted: false,
});

// Builds a test result from failure test
export const buildFailureTestResult = (
  testPath: string,
  err: SerializableError
): TestResult => ({
  console: undefined,
  displayName: undefined,
  failureMessage: null,
  leaks: false,
  numFailingTests: 0,
  numPassingTests: 0,
  numPendingTests: 0,
  numTodoTests: 0,
  openHandles: [],
  perfStats: {
    end: 0,
    runtime: 0,
    slow: false,
    start: 0,
  },
  skipped: false,
  snapshot: {
    added: 0,
    fileDeleted: false,
    matched: 0,
    unchecked: 0,
    uncheckedKeys: [],
    unmatched: 0,
    updated: 0,
  },
  testExecError: err,
  testFilePath: testPath,
  testResults: [],
});

// Add individual test result to an aggregated test result
export const addResult = (
  aggregatedResults: AggregatedResult,
  testResult: TestResult
): void => {
  // `todos` are new as of Jest 24, and not all runners return it.
  // Set it to `0` to avoid `NaN`
  if (!testResult.numTodoTests) {
    testResult.numTodoTests = 0;
  }

  aggregatedResults.testResults.push(testResult);
  aggregatedResults.numTotalTests +=
    testResult.numPassingTests +
    testResult.numFailingTests +
    testResult.numPendingTests +
    testResult.numTodoTests;
  aggregatedResults.numFailedTests += testResult.numFailingTests;
  aggregatedResults.numPassedTests += testResult.numPassingTests;
  aggregatedResults.numPendingTests += testResult.numPendingTests;
  aggregatedResults.numTodoTests += testResult.numTodoTests;

  if (testResult.testExecError) {
    aggregatedResults.numRuntimeErrorTestSuites++;
  }

  if (testResult.skipped) {
    aggregatedResults.numPendingTestSuites++;
  } else if (testResult.numFailingTests > 0 || testResult.testExecError) {
    aggregatedResults.numFailedTestSuites++;
  } else {
    aggregatedResults.numPassedTestSuites++;
  }

  // Snapshot data
  if (testResult.snapshot.added) {
    aggregatedResults.snapshot.filesAdded++;
  }
  if (testResult.snapshot.fileDeleted) {
    aggregatedResults.snapshot.filesRemoved++;
  }
  if (testResult.snapshot.unmatched) {
    aggregatedResults.snapshot.filesUnmatched++;
  }
  if (testResult.snapshot.updated) {
    aggregatedResults.snapshot.filesUpdated++;
  }

  aggregatedResults.snapshot.added += testResult.snapshot.added;
  aggregatedResults.snapshot.matched += testResult.snapshot.matched;
  aggregatedResults.snapshot.unchecked += testResult.snapshot.unchecked;
  if (
    testResult.snapshot.uncheckedKeys != null &&
    testResult.snapshot.uncheckedKeys.length > 0
  ) {
    aggregatedResults.snapshot.uncheckedKeysByFile.push({
      filePath: testResult.testFilePath,
      keys: testResult.snapshot.uncheckedKeys,
    });
  }

  aggregatedResults.snapshot.unmatched += testResult.snapshot.unmatched;
  aggregatedResults.snapshot.updated += testResult.snapshot.updated;
  aggregatedResults.snapshot.total +=
    testResult.snapshot.added +
    testResult.snapshot.matched +
    testResult.snapshot.unmatched +
    testResult.snapshot.updated;
};

export const createEmptyTestResult = (): TestResult => ({
  leaks: false, // That's legacy code, just adding it as needed for typing
  numFailingTests: 0,
  numPassingTests: 0,
  numPendingTests: 0,
  numTodoTests: 0,
  openHandles: [],
  perfStats: {
    end: 0,
    runtime: 0,
    slow: false,
    start: 0,
  },
  skipped: false,
  snapshot: {
    added: 0,
    fileDeleted: false,
    matched: 0,
    unchecked: 0,
    uncheckedKeys: [],
    unmatched: 0,
    updated: 0,
  },
  testFilePath: '',
  testResults: [],
});
```

```ts
// packages/jest-core/src/TestScheduler.ts

class TestScheduler {
  async scheduleTests(
    tests: Array<Test>,
    watcher: TestWatcher
  ): Promise<AggregatedResult> {
    // ...
    const aggregatedResults = createAggregatedResults(tests.length);
    // ...

    const onResult = async (test: Test, testResult: TestResult) => {
      // ...
      addResult(aggregatedResults, testResult);
      // ...
    };

    const onFailure = async (test: Test, error: SerializableError) => {
      // ...
      const testResult = buildFailureTestResult(test.path, error);
      testResult.failureMessage = formatExecError(
        testResult.testExecError,
        test.context.config,
        this._globalConfig,
        test.path
      );
      addResult(aggregatedResults, testResult);
      // ...
    };
    // ...
    aggregatedResults.success = !(
      anyTestFailures ||
      aggregatedResults.snapshot.failure ||
      anyReporterErrors
    );

    return aggregatedResults;
  }
}

// ...

// https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L423
const createAggregatedResults = (numTotalTestSuites: number) => {
  const result = makeEmptyAggregatedTestResult();
  result.numTotalTestSuites = numTotalTestSuites;
  result.startTime = Date.now();
  result.success = false;
  return result;
};
```

## See also

### JS ecosystem > Testing Frameworks > Jest 🤡

- [Architecture 🏛 > Appx. Ⅱ: jest-worker 👷‍♂️](./appendix-2-jest-worker.md)
