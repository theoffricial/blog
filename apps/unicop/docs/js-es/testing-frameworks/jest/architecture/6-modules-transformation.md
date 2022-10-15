# Unit Tests - Jest - Architecture - 6. Modules Transformation

---

jest supports [CommonJS] out-of-the-box, but module transpilation is required when using TypeScript or Babel. The transpilation step call "transform" and it is happens the during a test run, this approach also known as transpile "just-in-time".

Mentioned on the previous chapter, jest run tests in an isolated virtual machine environment and injects for that environment a custom implementation for `require`.

That custom implementation let jest to control how modules are imported.

:::note
Jest docs show you how to use [code transformation with jest](https://jestjs.io/docs/code-transformation) as jest user.
:::

## How Module Transform works in Practice

When a test is running and require a module, the custom require implementation goes outside of the sandbox context where your test run, and go to the `jest-runtime` and look for the module that the test just required, after the test `HasteMap` finding it, the require implementation check whether the module has transformed, where the transformer can be Babel (`babel-jest`) or TypeScript based on what you specified.

### Transformation & Cache

The transformation step is expensive, how exactly?
According to what @christoph mentioned in his video about Jest Architecture that the transform step often takes more than 50% of the entire test run.

That's why jest not just cache the source modules, but also the transformed modules.

Keep that in mind when you measure the time it takes to run tests, and always evaluate the initial run time, and measure later invocations by averaging some of them, but do it separately.

<!-- Maybe add an appendix about measuring test times? -->

<!--
##### Add a cache summary appendix

So on the  or right after cached cleared,

jest caches both the source modules and the transformed modules.

Because that during the first run jest has no cache, the first run takes much longer, because jest because the `jest-haste-map` has to crawl and access the entire file system for the dependency resolution and then `jest-runtime` needs to transform all modules.
Also the `TestSequencer` cached data for optimizations.
So the 2nd run should be quicker by something around 50%, that because transformations often takes more than 50% of the entire test run time.

So if you try to measure the time it takes for a test framework to run tests, always evaluate the initial run time but also later invocations and average them, but definitely consider the first run and a subsequent run separately. -->

## Module Transformation Code Highlights

Thread with the real code & references that in charge of the transformation in jest.

```ts
// jest-runtime/src/index.ts
export default class Runtime {
  // ...

  // 1. The function that in charge to execute a required module
  private _execModule(
    localModule: InitialModule,
    options: InternalModuleOptions | undefined,
    moduleRegistry: ModuleRegistry,
    from: string | null
  ) {
    // ...
    const module = localModule as Module;
    const filename = module.filename;

    // ...

    // 2. Set to the module the custom require implementation
    Object.defineProperty(module, 'require', {
      value: this._createRequireImplementation(module, options),
    });

    // 3. Transform the module
    const transformedCode = this.transformFile(filename, options);

    // ...

    // 4. Build the VM script/context
    const script = this.createScriptFromCode(transformedCode, filename);

    let runScript: RunScriptEvalResult | null = null;

    const vmContext = this._environment.getVmContext();

    if (vmContext) {
      runScript = script.runInContext(vmContext, { filename });
    }
    // ...
  }

  // https://github.com/facebook/jest/blob/main/packages/jest-runtime/src/index.ts#L1501-L1533
  private transformFile(
    filename: string,
    options?: InternalModuleOptions
  ): string {
    // get source module
    const source = this.readFile(filename);

    // is it a module that is part of jest system
    if (options?.isInternalModule) {
      return source;
    }

    let transformedFile: TransformResult | undefined =
      // runtime has its own maps besides cache, because it is faster than I/O actions
      this._fileTransforms.get(filename);

    // If transformed file found in runtime map, return it
    if (transformedFile) {
      return transformedFile.code;
    }

    // Otherwise, transform the file
    transformedFile = this._scriptTransformer.transform(
      filename,
      this._getFullTransformationOptions(options),
      source
    );

    // Add it to runtime map
    this._fileTransforms.set(filename, {
      ...transformedFile,
      wrapperLength: this.constructModuleWrapperStart().length,
    });

    // add source map file to runtime map
    if (transformedFile.sourceMapPath) {
      this._sourceMapRegistry.set(filename, transformedFile.sourceMapPath);
    }

    // return transformed code
    return transformedFile.code;
  }
  //  ...
}

// jest-transform/src/ScriptTransformer.ts
class ScriptTransformer {
  // ...
  // https://github.com/facebook/jest/blob/main/packages/jest-transform/src/ScriptTransformer.ts#L703-L730
  transform(
    filename: string,
    options: Options,
    fileSource?: string
  ): TransformResult {
    const instrument =
      options.coverageProvider === 'babel' &&
      shouldInstrument(filename, options, this._config);

    // try to get cache key for file
    const scriptCacheKey = getScriptCacheKey(filename, instrument);

    // try to get transformed file from cache
    let result = this._cache.transformedFiles.get(scriptCacheKey);
    // if found, return it
    if (result) {
      return result;
    }

    // Otherwise transform the file
    result = this._transformAndBuildScript(
      filename,
      options,
      { ...options, instrument },
      fileSource
    );

    if (scriptCacheKey) {
      // add transformed file to cache
      this._cache.transformedFiles.set(scriptCacheKey, result);
    }

    // return transformed module
    return result;
  }

  // ...
}
```

<!-- The reason it can't be async is that jest relies on transformation when the module required during the `jest-runtime` execution.
To support transformation to be async the jest architecture would have to be changed on the areas of the [dependency-resolutions] or before the `SearchSource`, but the most important thing is that to support async, jest would have to figure out which are all the files that are going to be required in a test run and then transform all of those files. -->
