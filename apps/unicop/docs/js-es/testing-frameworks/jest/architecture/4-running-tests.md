# Unit Tests - Jest - Architecture - 4. Test Run

The Jest Architecture Series

0. [Jest Full Architecture](./0-architecture-diagram.md)
1. [Jest - Configs](./1-configs.md)
2. [Jest - Dependencies Resolution](./2-dependency-resolutions.md)
3. [Jest - Determine Tests Run Order](./3-determining-how-to-run-tests.md)
4. **_[Jest - How Tests Run](./4-running-tests.md) 👈 You are here_**
5. [Jest - The Runtime Environment](./5-the-runtime-environment.md)

---

![Jest Architecture Test Run](/img/jest/4-architecture-test-run.svg)

## Introduction ✨

After receiving ordered tests to run, jest now is ready to start the test run itself.

The main component for the test run management is `TestScheduler` that sits on the `@jest/core` package.

On this step jest calls a component name `TestScheduler`,
With 2 main inputs:

- An array of tests (`Array<Tests>`), received from the `SearchSource` component
- The sequencing that we want the tests array to run in, received from the `TestSequencer` component

And in charge on how to actually run them optimally.

It is the most important module on jest to actually make sure that your tests run.

## Run InBand Or Concurrently

This first thing `TestScheduler` does is to check if jest prefers to run the tests on the same process as `jest-cli` itself runs, known as "in band", or should it schedule a great amount of work processes and then schedule the test run over them, and get back those results.

After the `TestScheduler` decided whether to run the tests in the same process or schedule multiple processes, it delegates the decision to the `jest-runner` together with the rest of the data.

Something I find interesting is that the jest team have noticed that the start-up time of jest takes long time when establishing multiple processes.
For this reason, another heuristic implemented in the `TestScheduler`, which tries to figure out how long it takes the test run for whole project.
If it finds it relatively small, even if you didn't pass the `--runInBand` option, instead of establishing multiple processes it run all tests on the same process, which is the exact behavior when passing the `--runInBand` option.

It is possible only when cache is available, and the jest team found it better for user experience.

<!-- But because initializing workers is expensive, the `TestScheduler` is checking the cache, if exists, for how long is the total duration of the project test run, if it finds it relatively short, it follows an heuristic that instead of establishing multiple workers, it runs all test in a single worker, because it finds it faster, and it does it to improve user experience. -->

### Example

Let's say you have in a project 10 tests that running all together take up to 5 seconds, it doesn't make sense to spawn 10 new processes that takes longer start-up time than the time it takes to actually run the tests, so such cases to improve user experience all the tests will run immediately on the same process as jest.

## Runners

Runner in jest is basically a piece of code that receive an input match a specific interface, do what ever it programmed to do and can return a result,
for instance, `jest-runner` returns an object with an `EventEmitter` to listen for asynchronous results.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L51-L54
// The interface TestScheduler expect jest-runner-* to follow
type TestRunnerConstructor = new (
  globalConfig: Config.GlobalConfig,
  testRunnerContext: TestRunnerContext
) => JestTestRunner;

// https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L169-L193
// How the emitter being returned back to the TestScheduler
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

jest default runner call `jest-runner`, which in charge to actually run tests, I will better cover how it works on the next articles in the series.

A cool thing about how the runner is plugged to the `TestScheduler`, is that it can be customized, for instance you can run `eslint` on your code base with jest using a custom runner call [jest-runner-eslint](https://github.com/jest-community/jest-runner-eslint) and with configuring the other jest configs you can build an optimized `eslint` run.

## Call the Test Runner

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

## Dispatching Reporters

The `TestScheduler` is also in charge to dispatch the `TestResult`s information to the reporters you configured.

Because of the event-based or callback-based implementation it is also possible to dispatch reporters every time the `TestScheduler` receives an update from the runner, that way the reporters, for instance the CLI reporter can be interactive an update you when a test succeed or failed, instead of waiting for the whole run to be completed.

## On Run Completion

The `TestScheduler` initialize an `aggregatedResult` object that should contains all results when all tests execution completed, it initialize it empty, aggregate results on each `TestResult` returned,
while the runner is waiting for all tests to be completed before it completes its run that the `TestScheduler` waits for its completion.

When all tests completed, the `TestScheudler` dispatch reporters that the test run completed, and return the `aggregatedResults`.
Then the `jestRun` who called the scheduler cache all tests results using the `@jest/test-sequencer` to use these results for future test runs.

## Credits 🎖️
