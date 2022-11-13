---
last_update:
  date: 07/10/2022
  author: Ofri Peretz
---

# Appendix Ⅴ: Watch Mode

The watch mode turns jest into a continuos test run that besides running tests is also listening to file system changes you do and respond accordingly.

On watch mode, in comparison to a single test run, the expectation for a different development experience. for example you would expect jest to respond immediately on file system changes, be responsive when interacting directly with the CLI to interrupt the current test run and so on.

To support such capabilities jest starts with different initialization and the whole architecture works with different mechanisms.

## Watch Mode & CLI Event Listeners

That is the first place watch mode takes into place, at the beginning of the jest system, and actually jest has a special run for watch mode, as you can see on the code highlights below.

The main thing I think worth mentioning is that the on the watch mode run, jest add listeners for key press to be responsible when we want to interrupt the test run and running something else.

### Code Highlights

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-core/src/cli/index.ts#L166-L231

// weird naming, but this internal function initials the jest test run
const _run10000 = async (
  globalConfig: Config.GlobalConfig,
  configs: Array<Config.ProjectConfig>,
  hasDeprecationWarnings: boolean,
  outputStream: NodeJS.WriteStream,
  onComplete: OnCompleteCallback
) => {
  // ...

  // choose run method based on watch options
  globalConfig.watch || globalConfig.watchAll
    ? await runWatch(
        contexts,
        configs,
        hasDeprecationWarnings,
        globalConfig,
        outputStream,
        hasteMapInstances,
        filter
      )
    : await runWithoutWatch(
        globalConfig,
        contexts,
        outputStream,
        onComplete,
        changedFilesPromise,
        filter
      );
};
```

```ts
// jest-core/src/watch.ts
// https://github.com/facebook/jest/blob/main/packages/jest-core/src/watch.ts#L89
// This function is the main function running inside the "runWatch" from above.
export default async function watch(
  initialGlobalConfig: Config.GlobalConfig,
  contexts: Array<TestContext>,
  outputStream: NodeJS.WriteStream,
  hasteMapInstances: Array<HasteMap>,
  stdin: NodeJS.ReadStream = process.stdin,
  hooks: JestHook = new JestHook(),
  filter?: Filter
): Promise<void> {
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-core/src/watch.ts#L338-L444
  // showing you that jest actually listens to key press!
  const onKeypress = (key: string) => {
    // ...
  };

  // ...
  stdin.on('data', onKeypress);
  // ...
}
```

## Watch Mode & FS Crawler

The second main thing watch mode has custom implementation is during the file system and files metadata extraction.
On `jest-haste-map` `build()`, there is a call to an internal `_watch()` function that does something only on watch mode, otherwise its just return an empty promise when enter to the no-op condition, and what it does is to initial another file crawler that listens to file changes, when they occur it triggers logic that re-builds the changed files and replace the correlated modules on the existing hasteMap, so next time a test file will require them, they will be up-to-date.

Some cool things worth mentioning:

1. The `fb-watchman` listener tracks any file system change, jest implemented a batched update using an interval with all changes happened since last batch. You can see that internal in the code highlights attached below.
2. `fb-watchman` (the default crawler) respond only to changes, jest doesn't need to crawl the entire file system.
3. Listening only to changed files is enable only when using `fb-watchman` as crawler, because the node-crawler doesn't support it, at least the implementation jest has (to be honest, I didn't check if today node already support it), but on any case on the recent versions of jest, `fb-watchman` is available out-of-the-box.

### Code Highlights

I shared some real code snippets from jest repository and a link if you want to see the whole logic.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L362-L403
// This class manages the file map and dependency resolution
class HasteMap extends EventEmitter implements IHasteMap {
  // ...

  // builds FS and Dependencies Tree
  build(): Promise<InternalHasteMapObject> {
    // ...
    // crawl file system
    const data = await this._buildFileMap();

    // Persist when we don't know if files changed (changedFiles undefined)
    // or when we know a file was changed or deleted.
    let hasteMap: InternalHasteMap;
    if (
      data.changedFiles === undefined ||
      data.changedFiles.size > 0 ||
      data.removedFiles.size > 0
    ) {
      // extract files metadata
      hasteMap = await this._buildHasteMap(data);
      // save to cache
      this._persist(hasteMap);
    } else {
      hasteMap = data.hasteMap;
    }

    // ...

    // add crawler watcher, if WATCH MODE is ON
    await this._watch(hasteMap);

    // for this example it is less matter what the function returns
    return {
      //  ...
    };
    // ...
  }

  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L809-L1019
  // the function called above
  private async _watch(hasteMap: InternalHasteMap): Promise<void> {
    // when watch mode is off, do nothing
    if (!this._options.watch) {
      return Promise.resolve();
    }

    // ...

    // WatchmanWatcher > FSEventsWatcher > sane.NodeWatcher
    const Watcher = (await this._shouldUseWatchman())
      ? // watchman support FSEvents watcher, so it can listens to specific file changes
        WatchmanWatcher
      : FSEventsWatcher.isSupported()
      ? FSEventsWatcher
      : // while node watch has to map again the entire file system
        NodeWatcher;

    // ...

    // the function that creates the watcher for all root directories.
    const createWatcher = (root: string): Promise<Watcher> => {
      const watcher = new Watcher(root, {
        dot: true,
        glob: extensions.map((extension) => `**/*.${extension}`),
        ignored: ignorePattern,
      });

      return new Promise((resolve, reject) => {
        const rejectTimeout = setTimeout(
          () => reject(new Error('Failed to start watch mode.')),
          MAX_WAIT_TIME
        );

        watcher.once('ready', () => {
          // sending updates interval
          clearTimeout(rejectTimeout);
          // "onChange" handles what to do with changes
          watcher.on('all', onChange);
          resolve(watcher);
        });
      });
    };

    // ...

    // sending updates interval
    this._changeInterval = setInterval(emitChange, CHANGE_INTERVAL);
    return Promise.all(this._options.roots.map(createWatcher)).then(
      (watchers) => {
        // keep reference for all watchers
        this._watchers = watchers;
      }
    );
  }
}
```

## Watch Mode & Test Run Interruption

As mentioned above, watch mode respond to file changes. When jest is already running tests and file changes detected, jest is interrupting the test run, and start building the `hasteMap` according to changes and then jest re-run tests.

To interrupt the test run jest has special conditions on the `TestScheduler` and the `jest-runner`, to respond if watcher has interrupted.

### Code Highlights

```ts
// jest-core/src/TestScheduler.ts
class TestScheduler {
    // ...
    // the function schedules runners to run tests
    async scheduleTests(
    tests: Array<Test>,
    watcher: TestWatcher,
  ): Promise<AggregatedResult> {
    // ...

    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L114
    const onResult = async (test: Test, testResult: TestResult) => {
      // so "onResult" when test run interrupted it immediately returns an empty promise.
      if (watcher.isInterrupted()) {
        return Promise.resolve();
      }
    };
    // https://github.com/facebook/jest/blob/main/packages/jest-core/src/TestScheduler.ts#L155
    const onFailure = async (test: Test, error: SerializableError) => {
      // so "onFailure" when test run interrupted it immediately returns an empty promise.
      if (watcher.isInterrupted()) {
        return;
      }
      //  ...
    }
    // ...
    try {
        for (const runner of Object.keys(testRunners)) {
            const testRunner = testRunners[runner];
            // ...
            if (testRunner.supportsEventEmitters) {
                // ...
                await testRunner.runTests(tests, watcher, testRunnerOptions);
                // ...
            } else {
                await testRunner.runTests(
                tests,
                watcher,
                onTestFileStart,
                onResult,
                onFailure,
                testRunnerOptions,
                );
            }
        }
    } catch (error) {
        // ignore error when test run was interrupted
        if (!watcher.isInterrupted()) {
            throw error;
        }
    }
    // ...
    // mark the aggregated results object has "interrupted"
    aggregatedResults.wasInterrupted = watcher.isInterrupted();
    // ...
    return aggregatedResults;
}
```

```ts
// jest-runner/src/index.ts
export default class TestRunner extends EmittingTestRunner {
  // ...

  // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L45
  // this function is in charge of running the tests on "jest-runner"
  async runTests(
    tests: Array<Test>,
    watcher: TestWatcher,
    options: TestRunnerOptions
  ): Promise<void> {
    return options.serial
    // as you can see below for each method when watcher interrupted,
    // the process cancel the test run.
      ? this.#createInBandTestRun(tests, watcher)
      : this.#createParallelTestRun(tests, watcher);
  }
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L55
  async #createInBandTestRun(tests: Array<Test>, watcher: TestWatcher) {
    // ...
    return tests.reduce((promise, test) =>
      mutex(() =>
        promise.then(async () => {
          if (watcher.isInterrupted()) {
            throw new CancelRun();
          }
          // ...
        })
      )
    );
  }
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-runner/src/index.ts#L96
  async #createParallelTestRun(tests: Array<Test>, watcher: TestWatcher) {
    // ...
    const worker = new Worker(require.resolve('./testWorker'), {
      // ...
    }) as JestWorkerFarm<TestWorker>;

    // ...
    const runTestInWorker = (test: Test) =>
      mutex(async () => {
        if (watcher.isInterrupted()) {
          return Promise.reject();
        }
        // ...
        const promise = worker.worker({
          // ...
        }) as PromiseWithCustomMessage<TestResult>;
        // ...
        return promise;
      });

    const onInterrupt = new Promise((_, reject) => {
      watcher.on('change', (state) => {
        if (state.interrupted) {
          reject(new CancelRun());
        }
      });
    });

    const runAllTests = Promise.all(
      tests.map((test) =>
        runTestInWorker(test)
          .then(
            result => // ...
          )
      )
    );

    const cleanup = async () => {
      // ...
    };

    return Promise.race([runAllTests, onInterrupt]).then(cleanup, cleanup);
  }
}
```

## Watch Mode & Module Transformation

The transformation part is just worth mention, the modules that affected by the file changes will have to go through transformation again.
