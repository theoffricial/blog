# Unit Tests - Jest - Architecture - 7. Test Results

The Jest Architecture Series

1. [Jest - Configs](./1-configs.md)
2. [Jest - Dependencies Resolution](./2-dependency-resolutions.md)
3. [Jest - Determine Tests Run Order](./3-determining-how-to-run-tests.md)
4. [Jest - How Tests Run](./4-running-tests.md)
5. **_[Isolate Test Runtime Environment](./4-running-tests.md) 👈 You are here_**

---

The test runs depends on the runner but one part that is constant is how it gets back from the runner back to the reporter with the test results.

When the runner completes the test run, for instance when `jest-jasmine2` or `jest-circus` it returns a mutable JavaScript object that update the test results.

The data in it is:

- Is the test passed the run
- which tests are in this test file
- how long does it take
- what are the names of these tests
- what are the errors and the stack traces

failed tests returns with much more data than when they pass.

All the `TestResult` data has to be JSON serializable because it goes over the bridge of the `jest-worker` where the data pass from one process to another where the `jest-runner`.

Then the `jest-runner` returns each `TestResult` after the test is finished running in a callback to the `TestScheduler` which in charge to aggregate all test results.

It does different things when a test fails or when a test pass, but in most of the times there is an object call `AggregatedTestResult`, which is similar to the `TestResult` type, a mutable javascript object where every time a test finishes running, it updates that object.

Whenever a test finishes running, the result also passed to the configure reporters so they can take an action, for example the CLI report will print if a test has passed in green 🟢 or print when a test failed in red 🔴 and the error message and stacktrace.
