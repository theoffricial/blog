# Unit Tests - Jest - Architecture - 2. File System & Dependencies Resolution

![Jest Architecture Dependencies Resolution](/img/jest/2-architecture-dependency-resolution.svg)

## Introduction ✨

At this point jest has already built all **[configs](./1-configs.md)** and can use them.

The next question jest asks is "What is the code base jest operates on? and what are the dependencies between the different modules?".

To answers these questions jest calls the `jest-haste-map` package.
`jest-haste-map` does static analysis to figure out all the files in the codebase and extract metadata about them, including dependencies.

Most of the functionality `jest-haste-map` does is to build `HasteMap` object, which is a file map between a file location (path) and its metadata (dependencies, id, etc.).

`jest-haste-map` doesn't return `HasteMap` as-is but build from it an `HasteContext` object,
which is (talking high-level) is the `HasteMap` wrapped as internal classes instances to support different abilities out-of-the-box for the rest of the jest system.

See types highlights

```ts
type HasteContext = { hasteFS: IHasteFS; moduleMap: IModuleMap };

// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/types.ts#L103
// key = filepath
type FileData = Map<string, FileMetaData>;

export type FileMetaData = [
  id: string,
  mtime: number,
  size: number,
  visited: 0 | 1,
  dependencies: string,
  sha1: string | null | undefined
];

class HasteFS extends IHasteFS {
  // jest-haste-map constructor
  // receives files map from haste map and implement some functions on it
  constructor({ rootDir, files }: { rootDir: string; files: FileData }) {
    // ...
  }
  // ...
}

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

type HasteMap = {
  clocks: WatchmanClocks;
  files: FileData;
  map: { [id: string]: ModuleMapItem };
  mocks: { [id: string]: string };
};
```

This haste map creation and synchronization is critical to jest startup performance.

Let's breakdown how the magic works

<!-- To answer it, jest needs to know what is the code base it operates on, and to map all files in it, and it does it by invoking the -->

<!-- `jest-haste-map` does static analysis to build the dependencies tree in the project, the tree is a flat map that the key is the module unique identifier, jest uses file-path as an identifier for each module, and the value stores the dependencies modules IDs. jest is using this map to traverse the dependencies tree. -->

## 1 - Initialize HasteMap

read data from the cache or create an empty structure.

```ts
  // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L408-L418
  // ...
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
```

## 2 - Codebase Discovery

Right after calling `jest-haste-map` the first thing it should do is to crawl the entire file system to get the list of all relevant files.
To do that jest supports the [fb-watchman](https://github.com/facebook/watchman) crawler, another library developed by Meta, and the native node-crawler.

The main difference between them is when you already has a cached map, because [fb-watchman](https://github.com/facebook/watchman) can crawl delta changes, while the node-crawler has to crawl the entire file system for every change.

:::note
`jest-haste-map` cache previous calls, which you can read more at the Cache section below.
:::

The crawling op builds metadata objects for every file. This builds the `files` part of the `HasteMap`.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L762-L804
  // ...
  private async _crawl(hasteMap: InternalHasteMap) {
    const options = this._options;
    const ignore = this._ignore.bind(this);
    const crawl = (await this._shouldUseWatchman()) ? watchmanCrawl : nodeCrawl;
    const crawlerOptions: CrawlerOptions = {
      computeSha1: options.computeSha1,
      data: hasteMap,
      enableSymlinks: options.enableSymlinks,
      extensions: options.extensions,
      forceNodeFilesystemAPI: options.forceNodeFilesystemAPI,
      ignore,
      rootDir: options.rootDir,
      roots: options.roots,
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
```

:::info
[fb-watchman crawl implementation](https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/crawlers/watchman.ts#L92)
[node-crawl implementation](https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/crawlers/node.ts#L196)
:::

<!-- `jest-haste-map` is using another Meta package call [fb-watchman](''), what watchman does is to scan and list all files in the file system that is under the project main folder.

This action is an heavy one and time consuming, especially for big projects.

The runtime output object, that jest will use, is `HasteContext` that stores some metadata that jest needs but the most important metadata is the `HasteFS` that stores a list of all files, and a flat map between each module and its dependencies. -->

## 3 - Parse & Extract Metadata from Files

To get file's metadata such as its dependencies you have to read its content and figure this out, and that is exactly what `jest-haste-map` does.

Now that `jest-haste-map` already has the entire file list in an object, it has to read every file and extract the metadata needed.

Because the haste map creation and synchronization is critical to startup performance and most tasks are blocked by I/O this step makes heavy use of
synchronous operations. It uses worker processes for parallelizing file
access and metadata extraction.

<!-- But the issue is that such I/O operation is expensive, especially when -->

To manage all I/O quickly as possible, the jest team created the `jest-worker` package to manage heavy jobs in parallel on multiple processes to improve performance.

So when using the `jest-worker` we expect that

- the worst case is to parse all files, e.g. the initial run.
- the best case is no file system access and retrieving all data from the cache - when there are no file changes since last time.
- the average case is a small number of changed files - You worked on a new feature.

<!-- The jest team developed the `jest-worker` package specifically for jest.
It's job is to build the dependency tree when receiving a list of files received by the `fb-watchman` execution.

The job is simple, read all files, and for each extract from the content the dependencies and return a list of the dependencies module IDs. -->

:::note
The `jest-worker` is a module for executing heavy tasks under forked processes in parallel, by providing a `Promise` based interface, minimum overhead, and bound workers.
Optimized to complete tasks the quickest possible, checking the number of available cores on the CPU, and ideally uses all, because of this "greedy" behavior
When jest consumes too much memory or CPU it might cause machine resources throttling, for such cases use the [maxWorkers](https://jestjs.io/docs/configuration#maxworkers-number--string) option to limit the number of parallel workers.
:::

See some code highlights to see how it works from the inside.

```ts
  // ...
  private _processFile(
    hasteMap: InternalHasteMap,
    map: ModuleMapData,
    mocks: MockData,
    filePath: string,
    workerOptions?: {forceInBand: boolean},
  ): Promise<void> | null {
    // ...
    // https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L535
    // Callback called when the response from the worker is successful.
    const workerReply = (metadata: WorkerMetadata) => {
      // `1` for truthy values instead of `true` to save cache space.
      fileMetadata[H.VISITED] = 1;

      const metadataId = metadata.id;
      const metadataModule = metadata.module;

      if (metadataId && metadataModule) {
        fileMetadata[H.ID] = metadataId;
        setModule(metadataId, metadataModule);
      }

      fileMetadata[H.DEPENDENCIES] = metadata.dependencies
        ? metadata.dependencies.join(H.DEPENDENCY_DELIM)
        : '';

      if (computeSha1) {
        fileMetadata[H.SHA1] = metadata.sha1;
      }
    };

    // Callback called when the response from the worker is an error.
    const workerError = (error: Error | any) => {
      if (typeof error !== 'object' || !error.message || !error.stack) {
        error = new Error(error);
        error.stack = ''; // Remove stack for stack-less errors.
      }

      if (!['ENOENT', 'EACCES'].includes(error.code)) {
        throw error;
      }

      // If a file cannot be read we remove it from the file list and
      // ignore the failure silently.
      hasteMap.files.delete(relativeFilePath);
    };

  // ...
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
```

```ts
// worker.ts - the file executed in parallel by jest-worker
// ...

// A summary of all metadata being collected

export async function worker(data: WorkerMessage): Promise<WorkerMetadata> {
  // ...
  dependencies = Array.from(
    extractor.extract(content, filePath, defaultDependencyExtractor.extract)
  );
  // module map attributes
  // H.MODULE = 0, H.PACKAGE = 1
  module = [relativeFilePath, H.MODULE /** OR */ H.PACKAGE];
  // If a SHA-1 is requested on update, compute it.
  sha1 = sha1hex(content || fs.readFileSync(filePath));
  // the file name
  id = fileData.name || hasteImpl.getHasteName(filePath);

  // ...
  return { dependencies, id, module, sha1 };
}
```

:::info
The default extractor reads file's content and look for `require` calls when working with [CommonJS](../../../fundamentals/javascript-module-systems-explained.md#-commonjs) module system, or for `import` calls when configured to look for [ES](../../../fundamentals/javascript-module-systems-explained.md#-ecmascript-modules-or-esm) module system modules.

See how jest default [dependency extractor](https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/lib/dependencyExtractor.ts) works.
:::

## 4 - Store New HasteMap To Cache

Wether `jest-haste-map` crawl and extract the entire file system or just a small number of changed files, the final result is a new `HasteMap` object,
And to optimize future runs, each time something has changed `jest-haste-map` will store it in cache.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L733-L738
  // ...
  /**
   * 4. serialize the new `HasteMap` in a cache file.
   * Worker processes can directly access the cache through `HasteMap.read()`.
   */
  private _persist(hasteMap: InternalHasteMap) {
    writeFileSync(this._cachePath, serialize(hasteMap));
  }`
  // ...
```

After storing the new `hasteMap`, it returns only the entire file map including metadata in an object call `HasteContext`.

```ts
// https://github.com/facebook/jest/blob/main/packages/jest-haste-map/src/index.ts#L362
  // ...
  build(): Promise<InternalHasteMapObject> {
    const rootDir = this._options.rootDir;
    const hasteFS = new HasteFS({
      files: hasteMap.files,
      rootDir,
    });
    const moduleMap = new HasteModuleMap({
      duplicates: hasteMap.duplicates,
      map: hasteMap.map,
      mocks: hasteMap.mocks,
      rootDir,
    });
    const __hasteMapForTest =
      (process.env.NODE_ENV === 'test' && hasteMap) || null;
    await this._watch(hasteMap);
    return {
      __hasteMapForTest,
      hasteFS,
      moduleMap,
    };
  }
  // ...
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

## Credits 🎖️

- [Christoph Nakazawa](https://twitter.com/cpojer) - For the great (but old) [Jest Architecture](https://youtu.be/3YDiloj8_d0) video, without it I won't be able to build this series.
- The past and present members/maintainers of jest 🙏

<!-- ### How Haste Dependency Detection Happen -->

<!-- The static analysis is simple, `jest-worker` is looking for `require` calls, when working with [CommonJS](../../../fundamentals/javascript-module-systems-explained.md#-commonjs) module system, and for `import` calls when working with [ES](../../../fundamentals/javascript-module-systems-explained.md#-ecmascript-modules-or-esm) module system. -->
<!--
### The Output

When done `jest-worker` builds the `HasteContext` object and returns it back to the `jest-cli`.

`HasteFS` is in the type of `Map<Path, Module>` where

- `Path` - a string, holds the file-path of the module
- `Module` - an object of type `{moduleID,mtime,number,dependencies}`
  - `moduleID` - the module unique identifier
  - `mtime` - last time the module modified, this one is used by the `fs-watchman` crawler.
  - `number` - has the file read or not
  - `dependencies` - array of strings of the the modules that this module depends on -->

<!-- ## 3 - The jest-haste-map cache mechanism

At this point `fb-watchman` has:

- list of all files,
- The capability to track any file system operation related to the project

To leverage `cache` and avoid scanning the entire codebase again, each time `fb-watchman` detects a modification at any of the files, it logs that file internally for its own track.

Then on the next time jest will run, it will ask `fb-watchman` the following: "This is the list of files you gave me, What has changed since then?".

Now `fb-watchman` will have to read once again only the changed files to verify dependencies, and to detect what modules might be affected by the changes.

It means that jest has to scan and read the entire codebase only once, which enables jest to be much faster. -->
