# Unit Tests - Jest - Architecture - Test Results Appendix

The Jest Architecture Series

1. [Jest - Configs](./1-configs.md)
2. [Jest - Dependencies Resolution](./2-dependency-resolutions.md)
3. [Jest - Determine Tests Run Order](./3-determining-how-to-run-tests.md)
4. [Jest - How Tests Run](./4-running-tests.md)
5. **_[Isolate Test Runtime Environment](./4-running-tests.md) 👈 You are here_**

---

This appendix summaries in a high-level the flow of test results in jest.

A `TestResult` is an interface from `@jest/test-results` package that determine the structure of the object being return when test has completed its run.

Below you can see the actual interface, but to summary these are some of the things it includes:

- Is the test passed
- The duration took to run the whole test file
- which tests and their names are in this test file
- errors and stack traces

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/types.ts#L90
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

## After TestResult Received

For each `TestResult` received, the runner fire a callback or an event, at one of them received during the runner initialization.

As we know the `TestScheduler` initialize all runners, and it is also implement what should be done when an individual test is completed, according to the run method ("in-band" on a single thread or in parallel), and what it does is

1. dispatch the test result to the configured reporters, to enable reporters to be responsive during the test run they , for example dispatching the CLI reporter, let it print immediately when test passed 🟢 or failed 🔴.
2. wait for all the tests to run to return the whole aggregated object and let the `@jest/test-sequencer` cache it.

But here is the actual implementation so you can watch yourself:

```ts
class TestScheduler {
  private readonly _context: TestSchedulerContext;
  private readonly _dispatcher: ReporterDispatcher;
  private readonly _globalConfig: Config.GlobalConfig;

  constructor(
    globalConfig: Config.GlobalConfig,
    context: TestSchedulerContext
  ) {
    this._context = context;
    // initial the reporters dispatcher!
    this._dispatcher = new ReporterDispatcher();
    this._globalConfig = globalConfig;
  }
  //   ...

  async scheduleTests(
    tests: Array<Test>,
    watcher: TestWatcher
  ): Promise<AggregatedResult> {
    // ...
    const aggregatedResults = createAggregatedResults(tests.length);
    // ...
    const onResult = async (test: Test, testResult: TestResult) => {
      // ...
      if (testResult.testResults.length === 0) {
        const message = 'Your test suite must contain at least one test.';

        return onFailure(test, {
          message,
          stack: new Error(message).stack,
        });
      }

      // Throws when the context is leaked after executing a test.
      if (testResult.leaks) {
        // ...
        return onFailure(test, {
          message,
          stack: new Error(message).stack,
        });
      }

      addResult(aggregatedResults, testResult);

      await this._dispatcher.onTestFileResult(
        test,
        testResult,
        aggregatedResults
      );

      // ...
    };

    const onFailure = async (test: Test, error: SerializableError) => {
      //  ...
      const testResult = buildFailureTestResult(test.path, error);
      // ...
      addResult(aggregatedResults, testResult);
      await this._dispatcher.onTestFileResult(
        test,
        testResult,
        aggregatedResults
      );
    };

    // ...
    if (testRunner.supportsEventEmitters) {
      const unsubscribes = [
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
    return aggregatedResults;
  }
  //   ...
}
```

How an individual test result aggregated:

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/helpers.ts#L80-L147
// Add individual test result to an aggregated test result
export const addResult = (
  aggregatedResults: AggregatedResult,
  testResult: TestResult
): void => {
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
```
