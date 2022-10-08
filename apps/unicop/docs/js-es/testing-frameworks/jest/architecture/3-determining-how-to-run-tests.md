# Unit Tests - Jest - Architecture - 3. Determining How To Run Tests

![Jest Architecture Run Order](/img/jest/3-architecture-run-order.svg)

## Introduction ✨

At the beginning of this step jest has:

```ts
const Context = {
  // More info at [File System & Dependency Resolution](./2-dependency-resolutions.md) article
  HasteContext;
  // More info at [Configs](./1-configs.md) article
  GlobalConfig;
  ProjectConfig;
}
```

So in this step jest figures out all test files in the code base and what is the right order to run them quickly as possible.

## Find Tests

The `HasteContext` contains the map of files, and at the `ProjectConfig` one of the options `testMatch` or `testRegex` are defined - these options determine what is the pattern for a test file.

:::info
[testMatch](https://jestjs.io/docs/configuration#testmatch-arraystring) option
[testRegex](https://jestjs.io/docs/configuration#testregex-string--arraystring) option
:::
:::note
Jest config cannot specify both `testMatch` and `testRegex` options.
:::

The high level concept is very simple, jest just use regex/glob pattern over all files.
For this job there is a dedicated component call `SearchSource` which currently is part of the `@jest/core` library.

That collect all types of test patterns and then find the test files based on these patterns and convert them into tests.

The code on this the `SearchSource` is pretty confusing so I will share highlights I find useful for general understanding.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/types.ts#L182-L193
export type Test = {
  context: TestContext;
  // test file run duration
  duration?: number;
  // test file path
  path: string;
};
export type TestContext = {
  config: Config.ProjectConfig;
  // contains the map of all files and files metadata
  hasteFS: IHasteFS;
  moduleMap: IModuleMap;
  resolver: Resolver;
};
```

```ts
// ...
// https://github.com/facebook/jest/blob/main/packages/jest-core/src/SearchSource.ts#L43-L48
// Converts the files into Test objects
const toTests = (context: TestContext, tests: Array<string>) =>
  tests.map((path) => ({
    context,
    // duration filled after test run
    duration: undefined,
    path,
  }));
// ...
```

:::note
jest supports extra patterns from the CLI, when you call jest like this `jest my-test-pattern1 my-test-pattern2`
The `SearchSource` component handles these patterns as well when looking for tests.
:::

The `SearchSource` returns as an output an object call `SearchResult`, but the most important piece of that are the `Array<Test>` it returns.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-core/src/SearchSource.ts#L21-L27
export type SearchResult = {
  noSCM?: boolean;
  stats?: Stats;
  collectCoverageFrom?: Set<string>;
  tests: Array<Test>;
  total?: number;
};
```

## Ordering Tests for Test Run

After receiving the `Array<Test>` we pass them into another component package call `@jest/test-sequencer` that in charge to sort the tests and returns the input array sorted according to priority.

### Demonstrating Tests Match

<!-- convert into a GIF -->

```bash
# Step 1 - list of files
# Where testRegex: test\\.js$
my-module.js
my-module.test.js
my-module-2.js
my-module-2.test.js

# output tests list
my-module.test.js
my-module-2.test.js

# Step 2 - Using the CLI pattern
# CLI pattern: jest my-module-2
# final output:
my-module-2.test.js

```

## Determining How To Run Tests

Regardless to the number of CPUs on your machine,
The `TestSequencer` is following a simple set of heuristics to determines the order to run the given `Array<Test>`, most of the heuristics relies on having cached results of previous runs to make more predictable assumptions, without cache the algorithm doesn't do much.

The algorithm:

```
1. Failed Tests - Has this test failed on the previous run? (Requires cache)
2. Duration - Has this test run before? if it does, what is the duration it took on the previous runs, prioritized by longest duration to shortest duration (Requires cache)
3. File Size - prioritized by the biggest file size to the smallest file size
```

The reason for this logic is to utilize the CPUs to work optimally as possible to complete running all tests fast as possible.

Let's demonstrate how following these conditions achieve completing all tests quickly as possible.

### The Failed Test Heuristic

The failed heuristic is not about improving the total test run duration, but focusing on user experience.

When test is in a red 🔴 state, means it failed, Before running all tests we want to make sure it turns back into a green 🟢 state, means it passes.

So when this one is about getting feedback as soon as possible,
The 2 other heuristics are purely about improving times.

### The Test Run Duration Heuristic

If it jest would run the `Array<Test>` naively, we might run all tests but the last one is a very expensive one that take several minutes.
So the optimization here is that when taking the longest test and schedule it first, it means that you start with the slowest tests and end with the fastest tests.

For an example let's say we run tests on a machine with 3 CPUs.

When ordering tests from slowest to faster if we've a super-slow test, it will occupy 1 CPU for the whole test run, but all other tests will run concurrently on the other threads.

### The Test File Size Heuristic

Although running according to the duration is optimizing the test run, there are test runs that we don't have such data to rely on, whether it is our first test runs or that we just cleared cache, for these runs, jest has no idea how long the duration each test takes, So as a fallback jest decide the order based on the test file size. Although file size is not a very accurate, it is cheap to calculate and improves the probability in comparison to the naive approach.

For example, if a test file has 1000 lines of code it should probably take longer to complete than a test file with only 5 lines of code.

#### When File Size Heuristic Doesn't Work

When a test file is very short, according to our example 5 lines test file, but it depends on a very expensive module with hundred thousands lines, for such case the 1000 lines test file might run quicker than the 5 lines one.

## Code Highlight

```ts
// ...
// https://github.com/facebook/jest/blob/main/packages/jest-test-sequencer/src/index.ts#L138-L183
sort(tests: Array<Test>): Array<Test> | Promise<Array<Test>> {
    /**
     * Sorting tests is very important because it has a great impact on the
     * user-perceived responsiveness and speed of the test run.
     *
     * If such information is on cache, tests are sorted based on:
     * -> Has it failed during the last run ?
     * Since it's important to provide the most expected feedback as quickly
     * as possible.
     * -> How long it took to run ?
     * Because running long tests first is an effort to minimize worker idle
     * time at the end of a long test run.
     * And if that information is not available they are sorted based on file size
     * since big test files usually take longer to complete.
     *
     * Note that a possible improvement would be to analyse other information
     * from the file other than its size.
     *
     */
    const stats: {[path: string]: number} = {};
    const fileSize = ({path, context: {hasteFS}}: Test) =>
      stats[path] || (stats[path] = hasteFS.getSize(path) || 0);
    const hasFailed = (cache: Cache, test: Test) =>
      cache[test.path] && cache[test.path][0] === FAIL;
    const time = (cache: Cache, test: Test) =>
      cache[test.path] && cache[test.path][1];

    tests.forEach(test => (test.duration = time(this._getCache(test), test)));
    return tests.sort((testA, testB) => {
      const cacheA = this._getCache(testA);
      const cacheB = this._getCache(testB);
      const failedA = hasFailed(cacheA, testA);
      const failedB = hasFailed(cacheB, testB);
      const hasTimeA = testA.duration != null;
      if (failedA !== failedB) {
        return failedA ? -1 : 1;
      } else if (hasTimeA != (testB.duration != null)) {
        // If only one of two tests has timing information, run it last
        return hasTimeA ? 1 : -1;
      } else if (testA.duration != null && testB.duration != null) {
        return testA.duration < testB.duration ? 1 : -1;
      } else {
        return fileSize(testA) < fileSize(testB) ? 1 : -1;
      }
    });
  }
// ...
```

## When Cache Predictions are Accurate

jest does averages of the last several executions, so if on the first 1-5 test runs the order jest is running the tests might look inconsistent, has jest collects more data, eventually you should see that the order becomes more consistent.
