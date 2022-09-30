# Unit Tests - Jest - Architecture - 6. Modules Transformation

The Jest Architecture Series

1. [Jest - Configs](./1-configs.md)
2. [Jest - Dependencies Resolution](./2-dependency-resolutions.md)
3. [Jest - Determine Tests Run Order](./3-determining-how-to-run-tests.md)
4. [Jest - How Tests Run](./4-running-tests.md)
5. **_[Isolate Test Runtime Environment](./4-running-tests.md) 👈 You are here_**

---

jest supports [CommonJS] out-of-the-box, but modules [transpilation] is required when using TypeScript or Babel. The transpilation step at jest call "transform".

The implementation that allows the transforms is being passed with the global object injected to the isolated environment,for the module system that runs in the environment context.

The way it works is that the `require` function that is being injected by the jest-runtime to the "vm" context and then when you require a module, jest goes outside of the sandbox context where your test run back to the jest-runtime and it looks at the module that the test is requiring, and then looks at whether that module has to transformed using Babel or TypeScript based on whatever project config specified.

Important thing is that this whole process happens synchronously, the reason why that is the `require` function is synchronous and jest does the transforms "just-in-time", meaning during runtime.

The reason it can't be async is that jest relies on transformation when the module required during the `jest-runtime` execution.
To support transformation to be async the jest architecture would have to be changed on the areas of the [dependency-resolutions] or before the `SearchSource`, but the most important thing is that to support async, jest would have to figure out which are all the files that are going to be required in a test run and then transform all of those files.

Both the source modules and the transformed modules are cached and that is why the first runs will take longer both because of the `jest-haste-map` that scans and and does dependency-resolutions and the `jest-runtime` that transforms the modules.
Also the `TestSequencer` cached data for optimizations.
So the 2nd run should be quicker by something around 50%, that because transformations often takes more than 50% of the entire test run time.

So if you try to measure the time it takes for a test framework to run tests, always evaluate the initial run time but also later invocations and average them, but definitely consider the first run and a subsequent run separately.
