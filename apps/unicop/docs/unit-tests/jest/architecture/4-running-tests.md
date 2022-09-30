# Unit Tests - Jest - Architecture - 4. How Tests Run

The Jest Architecture Series

1. [Jest - Configs](./1-configs.md)
2. [Jest - Dependencies Resolution](./2-dependency-resolutions.md)
3. [Jest - Determine Tests Run Order](./3-determining-how-to-run-tests.md)
4. **_[Jest - How Tests Run](./4-running-tests.md) 👈 You are here_**

---

On this step jest calls a component name `TestScheduler`,
With 2 main inputs:

- An array of tests (`Array<Tests>`), received from the `SearchSource` component
- The sequencing that we want the tests array to run in, received from the `TestSequencer` component

And in charge on how to actually run them optimally.

It is the most important module on jest to actually make sure that your tests run.

## Run In Band Or Concurrently

This first thing `TestScheduler` does is to check if jest prefers to run the tests on the same process as `jest-cli` itself runs, known as "in band", or should it schedule a great amount of work processes and then schedule the test run over them, and get back those results.

##

Some parts of the `TestScheduler` were extracted to different modules to make jest more generic.

One of them is the `jest-runner` that actually manages the test run, something cool is that the `jest-runner` allows you to use custom runners, for instance allows to run `eslint` on the project using jest with the custom `jest-runner-eslint` package.

After the `TestScheduler` decided whether to run the tests in the same process or schedule multiple processes, it delegates the decision to the `jest-runner` together with the rest of the data.

Then `jest-runner` calls the `jest-worker` package that creates however many processes needed, set them and run the tests.

The cool thing about the jest-worker process as you can see when it has being used in the `jest-haste-map` package, that you can use it anywhere in your own projects to parallelized work across multi processes.

While setting up, the `jest-runner` will pick a testing framework to use for actually running the tests, originally jest used to use `jasmine` under-the-hood, but the FB team found it too heavy and jest doesn't use every ability jasmine supports, so they stripped out irrelevant parts abd made it lighter and called that package `jest-jasmine2`.

But at the same time another test framework call `jest-circus` which is a completely different test framework that inspired in its architecture from flux to build up the tree of how which tests have to run and more obvious to figure out how tests are run so when your test get stuck you can kind of debug to see what happens, and gradually the FB using it instead of `jest-jasmine2`,
So if you're working with more up-to-date jest version, you can find in your dependencies the `jest-circus` otherwise, you will see only `jest-jasmine2`.

Both libraries implements the original jasmine syntax e.g. `describe`, `test`, `beforeEach`, etc.

## Reporters

The `TestScheduler` is also in charge to give information to reporters after receiving all test results, for any custom reporter defined in the configuration.

The `TestScheduler` is in charge of the establish as many parallel workers as the machine can run in parallel, to achieve the fastest test run.

But the FB team have noticed that the start-up time of jest takes long time when establishing multiple processes.
For this reason, there is an heuristic in the `TestScheduler` that tries to figure out how long is the project test run take,
if it finds it relatively small, instead of establishing multiple processes, it run the tests in a single one like if the `--runInBand` option is on.

But because initializing workers is expensive, the `TestScheduler` is checking the cache, if exists, for how long is the total duration of the project test run, if it finds it relatively short, it follows an heuristic that instead of establishing multiple workers, it runs all test in a single worker, because it finds it faster, and it does it to improve user experience.

For example, when having 10 tests that take in total 5 seconds to run, it doesn't make sense to spawn 10 processes that have long start-up time, longer than the time it takes to run the tests, and then to run a single test in each process.
Instead, jest runs project like this in a single process.

The FB team mentioned that this small optimization, doesn't sound smart but has a big effect on the user experience.

After determine if to run everything in a single process or in metabolic processes, it calls a package call `jest-runner`

<!-- but initial these
While initializing the `TestScheduler` also take a look on the cache, if exists, and check for the total duration of the test run, if it finds it relatively short, it follows another heuristic that instead of initial -->
