# Part 2. File System & Dependencies Resolution

## Introduction ✨

This part discuss 2 key questions jest should ask to complete a test run,
after figuring out **[configs](./part-1-configs.md)**.

1. "What is the code base am I operate on?"
2. "What are the dependencies between files?"

To answer those question, jest uses the `jest-haste-map` package,
which does static analysis to figure out data like, the list of all files of your project, the dependencies of every file, sizes of files, etc.

The haste map creation and synchronization is critical to jest startup performance.

Let's breakdown how the magic works

## Part 2: Diagram ✍️

import JestArchitectureSVG from './svg/part-2-dependency-resolution.svg';

<JestArchitectureSVG />

## Understanding HasteMap

`HasteMap` is an object that represents an entire file system.
To fill `HasteMap` with data, the outputs of actions such as crawling file system or extracting files metadata being saved in `HasteMap`.

### How HasteMap look like:

Sharing the real types from the jest repository

```ts
type HasteMap = {
  clocks: WatchmanClocks; // related to file crawling, irrelevant for this article
  files: FileData; // see below
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

## 1+2 - Build HasteMap

### 1 - Read Or Create New Map

The first thing `jest-haste-map` does is trying to look for an existing `HasteMap` from cache, if it does not exist it initialize an empty one.

### 2 - Discover The Codebase To Operate On (Crawl)

After "reading" the initial `HasteMap` `jest-haste-map` is going to crawl the entire file system of your project, find and returns back the list of all files within the project.

For the crawling job, jest supports 2 crawlers to do that

1. [fb-watchman](https://github.com/facebook/watchman) - crawler developed by Facebook, it is the default option when available and has more advance capabilities and optimizations
2. The native node-crawler which is the fallback when `fb-watchman` isn't available.

The main difference between the crawlers is while `fb-watchman` can crawl deltas when cache already available, the node-crawler has to crawl the entire file system every time, this ability let jest to leverage cache and make test run much shorter when `fb-watchman` available.

:::note
`jest-haste-map` cache `HasteMap` each build.
:::

The crawling op builds metadata objects for every file. This builds the `files` part of the `HasteMap`.

:::info
[fb-watchman crawler implementation](https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/crawlers/watchman.ts#L92)
[node-crawler implementation](https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/crawlers/node.ts#L196)
:::

### Build HasteMap Code Highlights 🔦

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

Next, `jest-haste-map` wants to figure out the metadata for all the files found, such as dependencies.

To get metadata `jest-haste-map` has to read each file content and collect it.

### Metadata Extraction and jest-worker

Maybe one of the most known limitations of nodejs is that it is a single threaded,
and that's why I/O operations are thread blocking actions, and because `HasteMap` creation and synchronization is essential for jest to startup, but also critical to startup performance, For the heavy I/O actions metadata extraction requires, it uses the `jest-worker` package that in charge of parallelize work.

Because when starting metadata extraction task we expect the following scenarios:

- worst case: parse all files, on first run for example.
- best case: no file-system changes from last run, then retrieving all data from cache.
- average case: small number of file system changes, like when working on a new feature.

:::note
You can read more about jest-worker on [Appendix. Ⅱ: jest-worker 👷](./appendix-2-jest-worker.md) article.
:::

### How dependencies found

After reading a file content, by default the extractor looks for `require` as nodejs works natively with [CommonJS](../../../foundations/javascript-module-systems-explained.md#-commonjs) and if nodejs configured to work with [ESM](../../../foundations/javascript-module-systems-explained.md#-ecmascript-modules-or-esm) it will look for `import` statements.

The full metadata jest collects for each file can be found above on the `FileMetadata` interface.

### Parse & Extract Metadata from Files Code Highlights 🔦

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

## 4 - Store HasteMap in Cache

Wether `jest-haste-map` crawl and extract the entire file system or just a small number of changed files, the final result is a new `HasteMap` object,
And to optimize future runs, Whenever files have changed `jest-haste-map` calculate the new `HasteMap` and store it in cache.

Here is how `jest-haste-map` stores `hasteMap` in cache:

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

After read, crawl, extract metadata and store in cache again, `jest-haste-map` is ready to return its output.

Instead of returning the new `hasteMap` it has just built, the `build()` function wraps the new map in a new instance of wrapper class call `HasteFS`, This class exports convenient utility functions to reach files and metadata.

After building the `HasteFS` instance, it returns in with a module map that match between a file and mock, platform and duplication and returns all together in an object call `HasteContext`.

### Build HasteContext Output Code Highlights 🔦

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

## What is Haste? - Historical Brief 🦕

HasteMap is a JavaScript implementation of Facebook's haste module system developed at around 2010 and used internally at Facebook (Meta) in the times before any other module system exist, before the era of CommonJS/ESM/AMD/UMD/etc.

The `jest-haste-map` implementation inspired by https://github.com/facebook/node-haste and was built with for high-performance in large code repositories with
hundreds of thousands of files which Facebook had at the time haste developed.
This implementation is scalable and provides predictable performance.

The idea of how Haste works is that Facebook used to manage all their codebase at a single huge project, and all the different modules were under a folder called `html/js`.

### Haste Evolution

So what they did was to add an header to each file, like this [one](https://github.com/facebook/fbjs/blob/main/packages/fbjs/src/dom/BrowserSupportCore.js#L7) that provides the unique name associates with that module, and was inside the file, the module name is global, it means that you could not provide the same name for 2 modules, although it might happened and also that no relative path was needed like the present module systems (as long as you don't use an alias), these relative paths can be sometimes really long and exhausting.

So in Hate instead of using `../my/relative/path/to/my-module.js`, you just had to call `my-module`.

Later on, instead of using declarative headers inside files, the implementation had changed to take the file-path/ name as the unique identifier. That way Facebook avoided to read the content of files for the modules list, but only for the step of building the tree of dependencies resolution, so it improved performance.
