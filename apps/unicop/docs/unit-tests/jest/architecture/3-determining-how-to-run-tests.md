# Unit Tests - Jest - Architecture - 3. Determining How To Run Tests

At this point jest received:

1. Both `GlobalConfig`, and `ProjectConfig` objects from `jest-config` - See more [here](./1-configs.md)
2. `HasteContext` object from `jest-haste-map` - See more [here](./2-dependency-resolutions.md)

To get both, after the first run when [cache exists](./2-dependency-resolutions.md#3---the-jest-haste-map-cache-mechanism) it should took up to 100ms, if your project is really big, it might take a bit longer.

After receiving all objects, the `jest-cli` uses the object to build a larger object call `Context`:

- Context - `{HasteContext,GlobalConfig,ProjectConfig}`

## From list of files to list of tests

The simplest way to run a test in jest is to call

```bash
jest # run all tests in project
# OR
jest <my-test> # run all tests that match the pattern (=includes this pattern)
```

Then the `jest-cli` is passing the `Context` object and the pattern argument if exists to another component of jest call `SearchSource` which finds all tests according to the given pattern in the list of files, in a simple way as using a regex to find what files to look for test files in combined with the [testRegex](https://jestjs.io/docs/configuration#testregex-string--arraystring) option or [testMatch](https://jestjs.io/docs/configuration/#testmatch-arraystring) if you prefer `glob` over `regex`.
the `SearchSource` gets the configured option from the `ProjectConfig` if defined, otherwise take the default from the `GlobalConfig` that are inside the `Context`, that jest uses as the pattern to detect test files.

Let me demonstrate

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
# CLI pattern: jest <my-module-2.js>
# final output:
my-module-2.test.js

```

Although `SearchSource` returns the final output of what tests to should run in type of `Array<Test>`, it doesn't determines `jest` in which order to run tests. This responsibility left for a different component call the `TestSequencer`.

```
Test = {Path, duration, Context}

- Path (string) = test file path
- duration (number) = time took to run the test (cached info)
- Context {HasteContext,GlobalConfig,ProjectConfig} - Received from jest-cli

```

For most projects the `Context` is the same for all `Test`s, but when multiple projects configured to run at the same test run, the passed `Context` might be different between each `Test`.

## Determining How To Run Tests

Regardless to the number of CPUs on your machine,
The `TestSequencer` is following a simple set of heuristics to determines the order to run the given `Array<Test>`, most of the heuristics relies on having cached results of previous runs to make more predictable assumptions, without cache the algorithm doesn't do much.

The algorithm:

```
1. Failed Tests - Has this test failed on the previous run?
2. Duration - Has this test run before? if it does, what is the duration it took on the previous runs, prioritized by longest duration to shortest duration
3. File Size - prioritized by the biggest file size to the smallest file size
```

The reason for this logic is to utilize the CPUs to work optimally as possible to complete running all tests fast as possible.

Let's demonstrate how following these conditions achieve completing all tests fastest possible.

### The Failed Test Heuristic

The failed heuristic is not about improving the test run duration, but focusing on user experience.

When test is red 🔴 state, means it failed, Before running all tests we want to make sure it turns back into a green 🟢 state, means it passes.

So when this one is about getting feedback as soon as possible,
The 2 other heuristics are purely about improving times.

For the example let's say that our machine has 3 CPUs.

### The Test Run Duration Heuristic

If it jest would run the `Array<Test>` naively, we might run all tests but the last one is a very expensive one that take several minutes.
So the optimization here is that when taking the longest test and schedule it first, it means that you start with the slowest tests and end with the fastest tests, so for our example the array last super-slow test will occupy 1 CPU for the whole test run, but all other tests will run concurrently on the other 2 threads.

### The Test File Size Heuristic

Although running according to the duration is optimizing the test run, there are test runs that we don't have such data to rely on, whether it is our first test runs or that we just cleared the cache, for these runs, jest has no idea how long the duration each test takes, So as a fallback jest making decisions according to test file size. Although file size is not a very accurate, it is cheap to calculate and still improves the probability in comparison to the naive approach.

For example, if a test file has 1000 lines of code it should probably take longer to complete its run than a test file with only 5 lines of code.

#### When File Size Heuristic Doesn't Work

When a test file is very short (5 lines), but it depends on a very expensive module (e.g. hundred thousands lines), so for that case the 1000 lines test file might be faster to execute than the 5 lines one.

## Caching Results

One last thing, jest does averages of the last several executions, so if on the first 1-5 test runs the order jest is running the tests might look inconsistent, has jest collects more data, eventually should see that the order becomes more consistent.
