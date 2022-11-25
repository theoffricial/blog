---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 11/25/2022
  author: Ofri Peretz
---

# Part 5. The Runtime Environment 💽

## Introduction ✨

This part is discussing how the jest-runner package works, which is responsible for running tests.

The jest-runner module implementation includes solutions for:
concurrency, test compatibility, avoiding side effects, analyzing and building a TestResult from a test file, and sending TestResult-s when ready back to the runner’s scheduler.

Because I’m considering jest-runner as the orchestrator for the test run, All modules it uses compound the runtime environment, And that is the reason for this part name “The Runtime Environment”.

:::note

Recap: [Part 4. Test Run](./part-4-test-run.md) is focusing how the `TestScheduler` scheduling `jest-runner`-s, for the events `jest-runner`-s are emitting to collect `TestResult`-s, and aggregates results that reflects the entire test run result.

:::

:::note

I find this part of Jest interesting because it reveals how Jest executing a test file that I write and translates it into a test result, which is the connection between technical implementation and good user experience.

:::

Here a step by step how the `jest-runner` module works:

1. by picking a run method
1. Setup the test environment,
1. Setup the runtime sandbox creator object
1. Create and run the test framework to analyze a test file result
1. emitting events with test results.

Below there are more detail explanations how step works

---

## Part 5. The Runtime Environment Diagram ✍️

import JestArchitectureSVG from './svg/part-5-the-runtime-environment.svg';

<JestArchitectureSVG />

---

## Step 1. Choosing The Run Method

One of the arguments the `jest-runner` receives is what run method to use, when it supports 2 run methods: serial run (synchronous one by one), and parallel run.

### Serial Run, also called "In-Band"

When jest-runner is set for this run method, tests will run on the same process that Jest is running on.

:::info

The behavior is different on watch mode, where the Jest process’ TTY should remain responsive for user actions, so `jest-runner` spawn another process and runs tests one by one on the forked process.

:::

### Run Tests In Parallel

When `jest-runner` is set to run tests in parallel, it calls the `jest-worker` module to spawn processes according to the `maxWorkers` option.
When calling the worker to run tests, that work is responsible to attach a test for a forked process, while waiting for the entire test to complete but also limiting the number of concurrent calls to the worker to the number of processes the worker was allowed to spawn.

## Steps 2-4. Running a Test File

Once picking the run method, jest-runner starts running tests.

The test run is built out of 3 main modules:

- Step 2. The Test Environment
- Step 3. The Runtime Sandbox Creator
- Step 4. The Test Framework

:::note

Before moving forward,
Make sure you know what `Environment` and `Test Environment` terms are.

:::

### Step 2. Building a Compatible Test Environment

Setting up the Jest Test Environment is the first thing Jest does in the test run.

It picks the Test Environment based on config and injects it to a dedicated VM context object that will run as the global scope of the test files.
The context object will be used by the runtime implementation, which I will discuss next.

:::note

If you are here to configure the environment, see my `How to use Jest Environments` article.

:::

### Step 3. Building a Sandbox For Test Execution

Jest has a special module called `jest-runtime` which implements the runtime sandbox for test files run.
It is a class that receives a Test Environment as an argument and returns an instance with utility functions to load and execute modules in a sandbox, to avoid interruptions when executing modules in parallel.

Executing a module includes

1. Building an isolated script using the Nodejs vm library which the global scope of this script is the environment.
2. Injecting a custom “require” implementation to load modules according to the Jest system (Haste), and not the Nodejs default one.
3. Module Transformation - transforming modules to a form jest can process, using the “just in time” approach, the next part is all about the module transformation.

:::note

The `vm` library doesn’t consider a secured solution for running untrusted code because it is possible to break out of it, but for testing where the entire code is trusted, it is convenient.

In fact, Jest actually breaks out of the `VM` sandbox to load the dependencies of the executed module!

:::

### Step 4. The Test Framework - Initialization & Running a Test

Like many other modules of jest, the test framework is configurable, when every test framework:

1. receives both the test environment and the `jest-runtime` instance.
1. Has an implementation for the `Jest Globals`, like `describe`, `test`, etc. and injects them to the test environment object before binding it to a test file execution
1. Executing a test file and analyze its result

:::note

If you are curious what implementations jest use as `Test Framework`-s, I created an appendix - **[Jest Test Frameworks Evolution](./appendix-6-frameworks-evolution.md)** to describe the progress Jest did in this area.

:::

---

## Step 5. Propagation of `TestResult`-s

For both running methods, once a test file result object has returned, the jest-runner immediately emitting an event for the TestScheduler to catch and process.

## Outroduction 👋

I hope that looking once again on the [Runtime Environment Diagram](#part-5-the-runtime-environment-diagram-✍️) above make better sense to you and you understand at light at high-level how jest run tests.

Next, part 6 focuses on the code transformation that happens and is managed as part of the sandbox creator (the jest-runtime module), and why it is necessary.

:::note

For the implementations of everything I covered, here some relevant refs:

- [Step 1. Choose Run Method](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L45-L53)
- [Step 2. Building a Compatible Test Environment](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/runTest.ts#L85-L176)
- [Step 3. Building a Sandbox For Test Execution](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/runTest.ts#L184-L200)
- [Step 4. The Test Framework - Initialization](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/runTest.ts#L111-L116)
- [Step 4. The Test Framework - Running a Test](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/runTest.ts#L300-L307)
- [Step 5. Propagation of TestResult-s](https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L76-L90)

:::

## See also

### Software Foundations 🏗️

- [Run-time 🏷️](../../../../foundations/run-time.md)
- [Environment 🏷️](../../../../foundations/environment.md)

### JS ecosystem > Testing Frameworks > Jest 🤡

- [Architecture 🏛 > Appx. Ⅰ: Jest Hoisting 🆙](./appendix-1-hoisting.md)
- [Architecture 🏛 > Appx. Ⅱ: jest-worker 👷‍♂️](./appendix-2-jest-worker.md)
- [Architecture 🏛 > Appx. Ⅵ: Framework Evolution 🦕](./appendix-6-frameworks-evolution.md)
