---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 11/25/2022
  author: Ofri Peretz
---

# Part 2. File System & Build Dependencies Graph

## Introduction ✨

Recap: at part 1, Jest has parsed its [run-time](../../../../foundations/run-time.md) configuration values for its test run.

After Jest has its configuration, the next things Jest figures out are:

<!-- This part discuss 2 key questions jest should ask to complete a test run,
after figuring out **[configs](./part-1-configs.md)**. -->

1. _"What is the code base am I operate on?"_
2. _"What are the dependencies between files in the code base I operate on?"_

To solve these questions, Jest is using a dedicated package call `jest-haste-map`,
which includes actions like file system crawling, and metadata static analysis.

This step is crucial for Jest startup performance, so it includes some optimizations that makes it more complex.

## Part 2: FS & Build Deps. Graph Diagram ✍️

import JestArchitectureSVG from './svg/part-2-dependency-resolution.svg';

<JestArchitectureSVG />

## Understanding HasteMap

`HasteMap` is Jest's representation for all project files, and tracking each module's metadata, including its dependencies.

The `jest-haste-map` package role is to build you an `HasteMap` of your project.

Let's take a look how it looks like!

### How HasteMap is Look Like:

These are real types from the Jest repository, links attached, Also I added extra comments to make sure everything is clear.

```ts
type HasteMap = {
  clocks: WatchmanClocks; // related to file crawling, irrelevant for this article
  files: FileData; // §see below
  map: { [id: string]: ModuleMapItem }; // modules in multiple platform support
  // key {[id: string]} - mock file path
  // value {string} - relative path of the actual file
  mocks: { [id: string]: string }; // Managing how jest find and resolve mocks
};

// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/types.ts#L103
// key = filepath
type FileData = Map<string, FileMetaData>;

// Modules can be targeted to a specific platform based on the file name.
// Example: platform.ios.js and Platform.android.js will both map to the same
// `Platform` module. The platform should be specified during resolution.
type ModuleMapItem = { [platform: string]: ModuleMetaData };
//
type ModuleMetaData = {
  path: string; // the path to look up the file object in `files`.
  type: string; // the module type (either `package` or `module`).
};

export type FileMetaData = [
  id: string, // used to look up module metadata objects in `map`.
  mtime: number, // check for outdated files.
  size: number, // size of the file in bytes.
  visited: 0 | 1, // whether the file has been parsed or not.
  dependencies: Array<string>, // all relative dependencies of this file.
  sha1: string | null | undefined // SHA-1 of the file, if requested via options, for cache validation
];
```

## How `jest-haste-map` Builds an HasteMap Object

The Jest repository itself divides the build process into 4 major steps

1. If `HasteMap` exists in cache; then read it and exist; Otherwise, Create a new empty one;
2.

### 1 - Read Or Create New Map

First,
The first thing `jest-haste-map` does is trying to look for an existing `HasteMap` from cache, if it doesn't exist, a new empty `HasteMap` will be initialized.

### 2 - Discover Filesystem To Operate On (Crawl Filesystem)

Right after `HasteMap` initialization, `jest-haste-map` crawls the filesystem, according to pattern in the configuration, then returns a list of files, which represents the entire project.

Jest supports 2 crawlers:

1. [fb-watchman](https://github.com/facebook/watchman) - crawler developed by Facebook, it is the default option when available and has more advance capabilities and optimizations
2. The native node-crawler which is the fallback when `fb-watchman` isn't available.

The main advantage of the `fb-watchman` crawler, is its capability to crawl "deltas" means to crawl after first scan only what has changed since last time the projected crawl the filesystem.
On the other hand, when working with the node-crawler for each rebuild, the node-crawler force to crawl the entire filesystem every time any change has detected.

This advantage makes the `fb-watchman` crawler build much faster over time/several build.

:::note
`jest-haste-map` cache `HasteMap` each build.
:::

<!-- The crawling operation builds metadata objects for every file. This builds the `files` part of the `HasteMap`. -->

:::info
Here are references for Jest implementation for both crawlers:

1. [fb-watchman crawler implementation](https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/crawlers/watchman.ts#L92)
2. [node-crawler implementation](https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/crawlers/node.ts#L196)

:::

## Step 1 + 2: See Real Jest Implementation Highlights 🔦

Including references:

```ts
class HasteMap extends EventEmitter implements IHasteMap {
  // ...
  // Being called from @jest/cli after creating HasteMap instance
  build(): Promise<InternalHasteMapObject> {
    // ...
    // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L365
    // Builds file map
    const data = await this._buildFileMap();
    // ...
  }

  // ..
  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L433
  private async _buildFileMap(): Promise<{
    removedFiles: FileData;
    changedFiles?: FileData;
    hasteMap: InternalHasteMap;
  }> {
    let hasteMap: InternalHasteMap;
    try {
      /**
       * 1. read data from the cache or create an empty structure.
       */
      const read = this._options.resetCache ? this._createEmptyMap : this.read;
      hasteMap = read.call(this);
    } catch {
      hasteMap = this._createEmptyMap();
    }
    /**
     * 2. crawl the file system.
     */
    return this._crawl(hasteMap);
  }

  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L408-L418
  /**
   * 1. read data from the cache or create an empty structure.
   */
  read(): InternalHasteMap {
    let hasteMap: InternalHasteMap;

    try {
      hasteMap = deserialize(readFileSync(this._cachePath));
    } catch {
      hasteMap = this._createEmptyMap();
    }

    return hasteMap;
  }
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L762-L804
  private async _crawl(hasteMap: InternalHasteMap) {
    const options = this._options;
    const ignore = this._ignore.bind(this);
    const crawl = (await this._shouldUseWatchman()) ? watchmanCrawl : nodeCrawl;
    const crawlerOptions: CrawlerOptions = {
      // ...options
    };

    const retry = (error: Error) => {
      // ...
    };

    try {
      return crawl(crawlerOptions).catch(retry);
    } catch (error: any) {
      return retry(error);
    }
  }
}
```

## 3 - Parse & Extract Metadata from Files

After having the project file list, `jest-haste-map` starts to process each file by reading its content and extract metadata from it, including dependencies.

### Metadata Extraction Process

The metadata extraction process is essential for Jest startup, it is responsible to build the dependency graph, by reading the content of the entire file list. that's why it is must to be process fast as possible. But by default it has a blocker - Node.js.

Node.js is single threaded technology by default, when I/O operations blocks the thread, even when using `async` (I/O are between a machine and it self, in comparison to API calls).

That's why `jest-haste-map` using the [jest-worker](./appendix-2-jest-worker.md) module to parallelize the I/O operations.

When starting the metadata extraction process there are several scenarios we can expect:

- worst case: parse all files, required on first run for example.
- best case: no file-system changes from last run, then retrieving all data from cache.
- average case: small number of file system changes, like when working on a new feature.

Jest knows to extract metadata only for changed files when working with the `fb-watchman` module. When working with `node-crawler` implementation every test run will be the worst case. That's why you should avoid using it.

:::note
`jest-worker` is a core module in the Jest system, that's why I created an appendix to the series that discuss specifically how `jest-worker` works.
[Appendix. Ⅱ: jest-worker 👷](./appendix-2-jest-worker.md) article.
:::

### How Jest Detect Dependencies

During the metadata extraction process, when reading file's content Jest looks for `require` calls when it's Node.js directed to the default [CommonJS](../../../foundations/modules/commonjs.md), or if Jest's Node.js configured to work with [ESM](../../../foundations/modules/esm.md) it will look for `import` statements.

:::note

To see all metadata Jest is looking for each file, See the `FileMetadata` interface [above](#L62).

:::

### Step 3: See Real Jest Implementation Highlights 🔦

```ts
// jest-haste-map/src/index.ts
class HasteMap extends EventEmitter implements IHasteMap {
  // ...

  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L451
  // process a single file
  private _processFile(
    hasteMap: InternalHasteMap,
    map: ModuleMapData,
    mocks: MockData,
    filePath: string,
    workerOptions?: { forceInBand: boolean }
  ): Promise<void> | null {
    // ...

    // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L652

    // Get worker and pass file path and dependencyExtractor
    return this._getWorker(workerOptions)
      .worker({
        computeDependencies: this._options.computeDependencies,
        computeSha1,
        dependencyExtractor: this._options.dependencyExtractor,
        filePath,
        hasteImplModulePath: this._options.hasteImplModulePath,
        rootDir,
      })
      .then(workerReply, workerError);
  }
}

// #####################################################

// jest-haste-map/src/lib/dependencyExtractor.ts

// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/lib/dependencyExtractor.ts#L73-L91
// The dependency extractor logic
export const extractor: DependencyExtractor = {
  extract(code) {
    // initial dependency set
    const dependencies = new Set<string>();

    const addDependency = (match: string, _: string, dep: string) => {
      dependencies.add(dep);
      return match;
    };

    // Go over file content and,
    // 1. Removing text
    // 2. Add dependency when detecting one
    code
      .replace(BLOCK_COMMENT_RE, '')
      .replace(LINE_COMMENT_RE, '')
      .replace(IMPORT_OR_EXPORT_RE, addDependency)
      .replace(REQUIRE_OR_DYNAMIC_IMPORT_RE, addDependency)
      .replace(JEST_EXTENSIONS_RE, addDependency);

    return dependencies;
  },
};
```

## 4 - Storing HasteMap in Cache

Wether `jest-haste-map` crawl and extract the entire file system or just a small number of changed files, the final result is a new `HasteMap` object,
And to optimize future test runs, When there are file changes
`jest-haste-map` [builds](#2---discover-filesystem-to-operate-on-crawl-filesystem) the new `HasteMap`, and stores it in cache.

### Step 4: See Real Jest Implementation Highlights 🔦

```ts
// jest-haste-map/src/index.ts
class HasteMap extends EventEmitter implements IHasteMap {
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L362
  build(): Promise<InternalHasteMapObject> {
    // ...
    const data = await this._buildFileMap();

    // Persist when we don't know if files changed (changedFiles undefined)
    // or when we know a file was changed or deleted.
    let hasteMap: InternalHasteMap;
    if (
      data.changedFiles === undefined ||
      data.changedFiles.size > 0 ||
      data.removedFiles.size > 0
    ) {
      hasteMap = await this._buildHasteMap(data);
      this._persist(hasteMap);
    } else {
      hasteMap = data.hasteMap;
    }
  }
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L733-L738
  /**
   * 4. serialize the new `HasteMap` in a cache file.
   * Worker processes can directly access the cache through `HasteMap.read()`.
   */
  private _persist(hasteMap: InternalHasteMap) {
    writeFileSync(this._cachePath, serialize(hasteMap));
  }
  // ...
}
```

## 5 - Build Output - `HasteContext`

After [read](#1---read-or-create-new-map), [crawl](#2---discover-filesystem-to-operate-on-crawl-filesystem), [extract metadata](#3---parse--extract-metadata-from-files), and [store `HasteMap` in cache](#4---storing-hastemap-in-cache), `jest-haste-map` is ready to return an output so the Jest startup can move to the next stages.

`jest-haste-map` doesn't return an `HasteMap` as-is, instead, it wraps it in an utility class instance call `HasteFS`, this class expose utility functions to reach files and metadata, and isolating the `HasteMap` object from modifications across the Jest system.

Then the `HasteFS` instance returns inside another object call `HasteContext`, that also includes a module map that match between a file and its mock, and a map for each module per platform (if necessary).

### Step 5: See Real Jest Implementation Highlights 🔦

```ts
// jest-core/src/lib/createContext.ts

// https://github.com/facebook/jest/blob/main/packages/jest-core/src/lib/createContext.ts#L13
type HasteContext = { hasteFS: IHasteFS; moduleMap: IModuleMap };

// ##############################################################

// jest-haste-map/src/HasteFS.ts

// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/HasteFS.ts#L13
class HasteFS extends IHasteFS {
  // See FileData type above
  constructor({ rootDir, files }: { rootDir: string; files: FileData }) {
    // ...
  }
  // ...
}

// ##############################################################

// jest-haste-map/src/types.ts

// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/types.ts#L42
export interface IHasteFS {
  exists(path: string): boolean;
  getAbsoluteFileIterator(): Iterable<string>;
  getAllFiles(): Array<string>;
  getDependencies(file: string): Array<string> | null;
  getSize(path: string): number | null;
  matchFiles(pattern: RegExp | string): Array<string>;
  matchFilesWithGlob(
    globs: ReadonlyArray<string>,
    root: string | null
  ): Set<string>;
}

// ##############################################################

// jest-haste-map/src/index.ts

class HasteMap extends EventEmitter implements IHasteMap {
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L362
  build(): Promise<InternalHasteMapObject> {
    // ...
    // See above if you want to see the actual code but:
    // 1.read/create
    // 2. crawl file system
    // 3. parse and extract metadata from changed files.
    // 4. serialize the new `HasteMap` in a cache file.

    // Now preparing output..

    const rootDir = this._options.rootDir;

    // here the hasteMap files passed to a new HasteFS instance
    const hasteFS = new HasteFS({
      files: hasteMap.files,
      rootDir,
    });

    // map between modules and different platforms, mocks, and detect duplications.
    const moduleMap = new HasteModuleMap({
      duplicates: hasteMap.duplicates,
      map: hasteMap.map,
      mocks: hasteMap.mocks,
      rootDir,
    });

    const __hasteMapForTest =
      (process.env.NODE_ENV === 'test' && hasteMap) || null;
    await this._watch(hasteMap);

    // Then return an object call "HasteContext"
    return {
      __hasteMapForTest,
      hasteFS, // file map
      moduleMap, // module map
    };
  }
  // ...
}
```

## What is "Haste"?

See an appendix of the series: [Appendix Ⅶ: What is "Haste"? 👾](./appendix-7-what-is-haste.md)

## See also

### JS ecosystem > Foundations 🏗️ > Modules

- [JavaScript Module Systems Summary 🫀](../../../foundations/modules/summary.md)

### JS ecosystem > Testing Frameworks > Jest 🤡

- [Architecture 🏛 > Appendix Ⅶ: What is "Haste"? 👾](./appendix-7-what-is-haste.md)
