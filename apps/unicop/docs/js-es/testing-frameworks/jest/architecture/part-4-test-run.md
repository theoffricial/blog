# Part 4. Test Run 🃏

## Introduction ✨

Now is the money time, after figuring out configs, file system, what tests to run and their order,
jest is ready to start the actual test run.

The main component that manages the entire test run call `TestScheduler` that is part of the `@jest/core` package.

Let's break down the steps one by one to find out how jest manages the test run.

:::note
This article concentrate on how the test run being manages and how the main components communicate with each other.
The next article **[Part 5. The Runtime Environment](./part-5-the-runtime-environment.md)** focused on the detail how jest is actually taking a test file and running it.
:::

## Part 4. Test Run Diagram ✍️

import JestArchitectureSVG from './svg/part-4-test-run.svg';

<JestArchitectureSVG />

## 1 - Choosing Run Method - "In-Band" Or In-Parallel

After the `TestScheduler` is being created, and start to schedule tests, the first action it does is to determine the execution method, where it has 2 options.

1. Run "in-band" - run all tests on a single process, on the same process jest is running, one after one in a synchronous sequence.
2. Run in-parallel - Schedule a great amount of work processes and then schedule tests to run over them, and get back their results asynchronously.

In general, if you want to run jest "in-band" mode you have to explicitly specific it with the `--runInBand` option,
but also on every test run, the `TestScheduler` is following heuristic which tries to figure out how long the entire test run will take.
If `TestScheduler` finds it relatively small, it will decide to run the tests "in-band", because establishing workers is expensive action and it will probably cause the test run to take longer.

So for small projects jest usually run everything "in-band" which increases user experience.
Also worth mention that for the `shouldRunInBand` heuristic to be consider, cache required.

Whatever the `TestScheduler` decides, it will send it to the `jest-runner` to execute together with all the other information the `jest-runner` expects.

#### The `shouldRunInBand` Heuristic Example

If a project has 10 tests, and running them takes up to 5 seconds.
For such case, it doesn't make sense to spawn 10 new processes that their start-up time probably be longer than the time it takes to actually run those tests.

That's why `TestScheduler` consider what might be the best running method for that project, running all tests immediately on the same process jest is running or spawn processes and run them in parallel.

This consideration of the `TestScheduler` call in jest code the `shouldRunInBand` heuristic, and it created mostly to improve user experience while project are relatively small (because large projects will always pick the parallel option if "in-band" not explicitly specified).

### Choosing Run Method - Code Highlights 🔦

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

## TestScheduler & Runners

While `TestScheduler` is the run orchestrator, and responsible for things like, initial runners, schedule runners and build for them the communication channel they support, runners are orchestrating how a certain task is being executed.

When running jest without using any custom runner, runner is the component that actually run a set of tests and return the test results.
But as you should already know, jest is modular. So in fact the `TestScheduler` interacts with runners following an agreed interface as input, and expect to receive `TestResult`s.

The `TestScheduler` supports 2 methods of interaction between a runner and itself:

1. Callback Runners - that receive callback functions as arguments, and call them when results are ready.
2. Emitter Runners - For this type of runners, the `TestScheduler` establish listeners for known events, and waiting for runners to emit results.

Both methods enable the `TestScheduler` receiving results asynchronously.

The modular implementation of the communication between a `TestScheduler` and the runners it is managing, enables to create custom runners that following those contracts and run them smoothly with jest.

The default runner that comes out-of-the-box is the `jest-runner` package, that its job is to run tests as we expect jest to do.
But the community have already developed custom runners to leverage jest and its optimize mechanisms as a legitimate runner for various tasks.

For instance, you can take a look at the custom runner [jest-runner-eslint](https://github.com/jest-community/jest-runner-eslint) that leverages jest as runner to run `eslint` over the "test files" (e.g. your entire codebase) you configure it.

### Runner Contracts - Code Highlights 🔦

#### Callback Runner Contracts:

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

#### Emitter Runner Contracts:

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

## Starting The Runner Tests Execution

The main job of the `TestScheduler` is to setup runners and execute them with proper configuration, including what tests to run, with what context information, and should it run on the same process or in parallel in multiple processes.

## How `TestScheduler` Handles Incoming `TestResult`s

The `TestScheduler` is handling incoming `TestResult`s from runners, and responsible for

1. Aggregate the asynchronous incoming `TestResult`s.
2. Dispatch every incoming `TestResult` to reporters.
3. Wait for all tests to complete and return the aggregated object.

### Handling Incoming `TestResult`s - Code Highlights 🔦

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

## Final Output - `AggregatedTestResult`

The aggregated result is an object that summaries all test results and being return back to the `runJest(..)` method on the `@jest/core` package, and then passed to the `@jest/test-sequencer` that cache the results to optimize future test runs.

### Final Output - Code Highlight 🔦

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
