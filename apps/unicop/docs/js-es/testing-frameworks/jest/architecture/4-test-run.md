# Part 4. Test Run 🃏

import PageStarter from '@site/src/components/PageStarter';

<PageStarter />

## Introduction ✨

Now is the money time, after figure out configs, file system, what tests to run and their order,
It is time to start the actual test run.

The main component that manages the entire test run call `TestScheduler` that is part of the `@jest/core` package.

Let's break down the steps one by one to find out how jest manages the test run.

:::note
This article concentrate on how the test run being manages and how the main components communicate with each other.
The next part [Part 5. The Runtime Environment](./5-the-runtime-environment.md) focused on the detail how jest is actually taking a test file and running it.
:::

<!-- After receiving ordered tests to run, jest now is ready to start the test run itself. -->

<!-- The main component for the test run management is `TestScheduler` that sits on the `@jest/core` package. -->

<!-- On this step jest calls a component name `TestScheduler`,
With 2 main inputs:

- An array of tests (`Array<Tests>`), received from the `SearchSource` component
- The sequencing that we want the tests array to run in, received from the `TestSequencer` component -->

<!-- And in charge on how to actually run them optimally. -->

<!-- It is the most important module on jest to actually make sure that your tests run. -->

## Part 4. Test Run Diagram ✍️

import JestArchitectureSVG from './4-jest-architecture-test-run.svg';

<JestArchitectureSVG />

## 1 - Choosing Running Method - "In-Band" Or In-Parallel

After the `TestScheduler` is being created, and start to schedule tests, the first action it does is to determine the execution method, where it has 2 options.

1. Run "in-band" - run all tests on a single process, on the same process jest is running, one after one in a synchronous sequence.
2. Run in-parallel - Schedule a great amount of work processes and then schedule tests to run over them, and get back their results asynchronously.

In general, if you want to run jest "in-band" mode you have to explicitly specific it with the `--runInBand` option,
but also on every test run, the `TestScheduler` is following heuristic which tries to figure out how long the entire test run will take.
If `TestScheduler` finds it relatively small, it will decide to run the tests "in-band", because establishing workers is expensive action and it will probably cause the test run to take longer.

So for small projects jest usually run everything "in-band" which increases user experience.
Also worth mention that for the `shouldRunInBand` heuristic to be consider, cache required.

Whatever the `TestScheduler` decides, it will send it to the `jest-runner` to execute together with all the other information the `jest-runner` expects.

### The `shouldRunInBand` Heuristic Example

Let's say a project has 10 tests that running them all takes up to 5 seconds.
On that case, it doesn't make sense to spawn 10 new processes that takes longer start-up time than the time it takes to actually run the tests,
So the `TestScheduler` will decide to run immediately on the same process as jest.

For cases like this one, the `shouldRunInBand` heuristic will improve the run time and the user experience, because jest will be more responsive faster.

### Choosing Running Method - Code Highlights 🔦

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

## Runners

Runner in jest is basically a piece of code that receive an input match a specific interface, run whatever it programmed to do and return a result via callback or event.
For instance, the default runner is `jest-runner`, that depends on the configuration but it returns `TestResult`s using a callback function or emit and event to listen for asynchronous results.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L51-L54
// The interface TestScheduler expect the runner it schedules will follow
type TestRunnerConstructor = new (
  globalConfig: Config.GlobalConfig,
  testRunnerContext: TestRunnerContext
) => JestTestRunner;

// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L169-L193
// An example how jest-runner emits events that the TestScheduler is listening for
const runAllTests = Promise.all(
  tests.map((test) =>
    runTestInWorker(test).then(
      (result) => this.#eventEmitter.emit('test-file-success', [test, result]),
      (error) => this.#eventEmitter.emit('test-file-failure', [test, error])
    )
  )
);
// ...
return Promise.race([runAllTests, onInterrupt]).then(cleanup, cleanup);
```

While custom runners can do whatever they were programmed to, the `jest-runner` package is actually running tests, but that is a good example a modular jest is, because the community developed custom runners like [jest-runner-eslint](https://github.com/jest-community/jest-runner-eslint) for instance, that leverages jest architecture to run `eslint` over your codebase faster.

:::note

A drill down into how the `jest-runner` package works can be found on the next part [Part 5. The Runtime Environment 💽](./5-the-runtime-environment.md).

:::

## Starting The Runner Tests Execution STOPPED HERE !!!!!

The main job of the `TestScheduler` is to setup runners and execute them with the proper configuration, including what tests to run, with what context information, and should it run on the same process or in parallel in multiple processes.

To be able to work in parallel, the `TestScheduler` supports listening to events or calling callbacks.

And returns `aggregatedResults` object back to the `@jest/core runJest` caller.

See implementation highlight 🤩

```ts
async scheduleTests(
    tests: Array<Test>,
    watcher: TestWatcher,
  ): Promise<AggregatedResult> {
    // ...

    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L248-L280
    if (testRunner.supportsEventEmitters) {
        const unsubscribes = [
        testRunner.on('test-file-start', ([test]) =>
            onTestFileStart(test),
        ),
        testRunner.on('test-file-success', ([test, testResult]) =>
            onResult(test, testResult),
        ),
        testRunner.on('test-file-failure', ([test, error]) =>
            onFailure(test, error),
        ),
        testRunner.on(
            'test-case-result',
            ([testPath, testCaseResult]) => {
            const test: Test = {context, path: testPath};
            this._dispatcher.onTestCaseResult(test, testCaseResult);
            },
        ),
        ];

        await testRunner.runTests(tests, watcher, testRunnerOptions);

        unsubscribes.forEach(sub => sub());
    } else {
        // otherwise support callback
        await testRunner.runTests(
            tests,
            watcher,
            onTestFileStart,
            onResult,
            onFailure,
            testRunnerOptions,
        );
    }
    // ...
    return aggregatedResults;
}
```

## Dispatching Updates To Reporters

The `TestScheduler` is also in charge to dispatch the `TestResult`s information to the reporters you configured.

Because of the event-based or callback-based implementation it is also possible to dispatch reporters every time the `TestScheduler` receives an update from the runner, that way the reporters, for instance the CLI reporter can be interactive an update you when a test succeed or failed, instead of waiting for the whole run to be completed.

## On Run Completion

The `TestScheduler` initialize an `aggregatedResult` object that should contains all results when all tests execution completed, it initialize it empty, aggregate results on each `TestResult` returned,
while the runner is waiting for all tests to be completed before it completes its run that the `TestScheduler` waits for its completion.

When all tests completed, the `TestScheudler` dispatch reporters that the test run completed, and return the `aggregatedResults`.
Then the `jestRun` who called the scheduler cache all tests results using the `@jest/test-sequencer` to use these results for future test runs.

## Credits 🎖️
