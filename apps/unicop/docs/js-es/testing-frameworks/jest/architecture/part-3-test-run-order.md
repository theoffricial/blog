---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 11/25/2022
  author: Ofri Peretz
---

# Part 3. Test Run Order (Optimizations) ⏳

## Introduction ✨

At this part of the Jest system, Jest already has both **[configs](./part-1-configs.md)**, and **[HasteContext](./part-2-dependency-graph.md)**.

```ts
const TestContext = {
  HasteContext;
  // configs
  GlobalConfig;
  ProjectConfig;
}
```

Now it is time to find test files, and determine their run order, which you are about to see that is crucial for the overall run time.

<!-- jest is following a set of 3 main heuristics to determine which test run first, an interesting thing is that jest not takes only time into account but also user experience, you will see exactly how on the following sections :) -->

<!-- But for now it is important for you to know that the motto of jest's heuristics is to run the SLOWEST tests first and the FASTEST last (examples included!). -->

<!-- :::note

Except how jest is ordering tests, I also combined with it the step of how jest is finding test files.

::: -->

<!-- ### A Recap from Parts 1 + 2

jest reaching the test run order determination step after it:

1. Part 1: Figured out **[configs](./part-1-configs.md)**.
2. Part 2: Built the up-to-date **[HasteContext](./part-2-dependency-graph.md)** that enable jest to find files and use their metadata (metadata like dependencies resolution). -->

<!-- The main input when reaching the test order step: -->

## Part 3. Test Run Order Diagram ✍️

import JestArchitectureSVG from './svg/part-3-run-order.svg';

<JestArchitectureSVG />

## 1 - `SearchSource` Finding Test Files

Before determine test run order, Jest has to locate what test files it should order.
To locate test file, Jest uses a module call `SearchSource`, which is currently not a standalone package, but part of the `@jest/core` package.

Has mentioned in the introduction, at this part of the Jest run, it always has the file lists it operates on.

Then based on it and the configuration option of one of `testMatch` or `testRegex` it loop over the file list and find matches to the regex/glob pattern, simple as that.

<!-- At this step of the run, jest has the access to all files from `HasteContext` and what are the patterns for test files be using one of `testMatch` or `testRegex` options.
Then it simply "regex" over the array and return you an array of tests, simple as that. -->

<!-- The `HasteContext` contains the map of files, and at the `ProjectConfig` one of the options `testMatch` or `testRegex` are defined - these options determine what is the pattern for a test file. -->

:::info

Here is Jest documentation for both pattern options:

- **[testMatch](https://jestjs.io/docs/configuration#testmatch-arraystring)** option - glob patterns
- **[testRegex](https://jestjs.io/docs/configuration#testregex-string--arraystring)** option - regex patterns

:::

### Step 1: See Real Jest Implementation Highlights 🔦

"Test" types:

```ts
// jest-test-result/src/types.ts

// https://github.com/facebook/jest/blob/main/packages/jest-test-result/src/types.ts#L182-L193
// What "Test" contains
export type Test = {
  context: TestContext;
  // test file run duration
  duration?: number;
  // test file path
  path: string;
};

export type TestContext = {
  config: Config.ProjectConfig; // config, contains "testRegex" and "testMatch" options
  hasteFS: IHasteFS; // contains access to all files and more utility functions
  moduleMap: IModuleMap; // module map to match file and mocks, platforms, etc.
  resolver: Resolver;
};
```

`SearchSource`

```ts
export default class SearchSource {
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-core/src/SearchSource.ts#L155
  // A small code example how it finds tests
  private _getAllTestPaths(testPathPattern: string): SearchResult {
    return this._filterTestPathsWithStats(
      // from context it extract config, and from hasteFS files
      toTests(this._context, this._context.hasteFS.getAllFiles()),
      // test pattern to filter tests
      testPathPattern
    );
  }
  // ...
}
```

### `SearchSource`'s Output

After "regex-ing" the entire file list, and finding tests, `SearchSource` eventually returns an object called `SearchResult` which includes all `Test`-s, and some less interesting data.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-core/src/SearchSource.ts#L21-L27
export type SearchResult = {
  noSCM?: boolean;
  stats?: Stats;
  collectCoverageFrom?: Set<string>;
  tests: Array<Test>;
  total?: number;
};

// ...

export default class SearchSource {
  // ...
  async getTestPaths(
    globalConfig: Config.GlobalConfig,
    changedFiles?: ChangedFiles,
    filter?: Filter
  ): Promise<SearchResult> {
    // ...
  }
  // ...
}
```

### Illustrating How `SearchSource` finds Tests

<!-- convert into a GIF -->

```bash
# Step 1 - list of files
my-module.js
my-module.test.js
my-module-2.js
my-module-2.test.js

# Step 2 - look for "testRegex"/"testMatch" options
# For this example, we have testRegex that equals to "test\\.js$"

# Step 3 - filtering by regex
# output tests list
my-module.test.js
my-module-2.test.js

# Step 4 - Filter by CLI pattern when passed
# The following command ran: "jest my-module-2"

# Step 5 - Filter CLI pattern and final output
# final output:
my-module-2.test.js

```

## 2 - Determining Test Run Order

With the `Array<Test>` that `SearchSource` found, Jest starts the test run order.
For that Jest has a dedicated package call `@jest/test-sequencer`, that regardless to the number of CPUs on your machine, sorts test array following a set of 3 heuristics.

:::note

2 out of 3 heuristics depend on cache from previous test runs to make more predictable assumptions,
Without cache the whole algorithm doesn't do much.

:::

### The Heuristics Algorithm 🤯

The reason for this logic is to utilize the CPUs to work optimally as possible to complete running all tests fast as possible.

_The algorithm:_

```bash
failed test > test run duration (slowest wins) > file size (largest wins)
```

#### Heuristic 1: Failed Tests (cache required)

The first question jest asks is: "Has this test failed on the previous run?"

The "failed" heuristic is not about improving the total test run duration, but focusing on user experience.

When test is in a red 🔴 state, means it failed, Before running all tests we want to make sure it turns back into a green 🟢 state, means it passes.

While the "failed" heuristic is about user experience and fast feedback,
The rest are purely about improving times.

#### Heuristic 2: Duration - Slowest Wins (cache required)

The second question is "Has this test run before?" if it does, "What is the duration it took on the previous runs?", prioritized by slowest duration to fastest duration.

To understand the logic of running SLOWEST first and FASTEST last better, Let's examine the naive approach.

If jest would run tests naively, there will be cases where successfully all tests run completed, But the most expensive and slowest test scheduled last and it takes several minutes to complete. Sounds like a waste isn't it?

So the approach of "slowest first" enable jest to optimize the entire test run by running the most expensive tests in parallel because jest leverages forked processes with **[jest-worker](./appendix-2-jest-worker.md)**, jest is non-blocked while the most expensive test is running and new tests can be scheduled in parallel.

##### Example:

For an example let's say a machine with 3 CPUs start a test run.

When ordering tests from slowest to faster if we've a super-slow test, it will occupy 1 CPU for the whole test run, but all other tests will run concurrently on the other threads.

#### Heuristic 3: File Size

Prioritized by the biggest file size to the smallest file size.

Although running according to the duration is optimizing the test run, there are test runs that we don't have such data from previous runs (for instance on the first run).
For those cases jest has no idea how long the each test takes to be completed, So to take a "better chances bet" the `@jest/test-sequencer` order the tests by the test file size where largest wins.

Although file size is not a very accurate, it is cheap to calculate and improves the probability in comparison to the naive approach.

##### Example:

- test file A - has 1000 lines of code
- test file B - has 5 lines of code

Intuitively test file A probably takes longer to run, the jest team found this very superficial calculation helps to improve times.

##### When File Size Heuristic Doesn't Work:

The file size heuristic fails when a test file is very short, for example let's take "test file B" from the example, when it is depends on a very expensive module with hundred thousands lines of code, for those scenarios "test file A" might run quicker and the heuristic missed its goal.

### Step 3: See Real Jest Implementation Highlights 🔦

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

## When Cache Predictions Become Accurate 🎯

As mentioned before, jest collects cache on each test run, but also it does averages between the previous test runs.
So when running jest for the 1st to 5th run, the test order might look inconsistent, because specific run might fake for some test files.
But as jest has more data, the statistics won't lie over many runs and the order will become more and more consistent.

<!-- add gif -->

## See also

### JS ecosystem > Testing Frameworks > Jest 🤡

- [Architecture 🏛 > Appx. Ⅱ: jest-worker 👷‍♂️](./appendix-2-jest-worker.md)
