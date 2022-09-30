# Unit Tests - Jest - Architecture - 5. Isolate Test Runtime Environment

The Jest Architecture Series

1. [Jest - Configs](./1-configs.md)
2. [Jest - Dependencies Resolution](./2-dependency-resolutions.md)
3. [Jest - Determine Tests Run Order](./3-determining-how-to-run-tests.md)
4. [Jest - How Tests Run](./4-running-tests.md)
5. **_[Isolate Test Runtime Environment](./4-running-tests.md) 👈 You are here_**

---

While actually running the tests both test framework jest might use (depends on your jest version), `jest-jasmine2` for older version or `jest-circus` for newer version, will use the `jest-runtime` package.

The jest-runtime is in charge of when running multiple test each lives in an isolated environments, even tests that runs on the same process, will be running in a different "vm" context.

jest-runtime leverages NodeJS built-in `vm` package, this package was created to create context for running JavaScript in isolation, which is exactly what jest needed.

The `vm` isn't considered secure environment, it is possible to "break out" of it, but for tests frameworks it is a good approach to use, because all the code runs as part of them can be trusted.

It allows you to custom the isolated environment NodeJS `global` scope, and it is easy to setup the environment that you need, in jest it might be js-dom environment for DOM apis, same for nodejs, it is possible to create a fake nodejs environment, so as part of that, jest provides a custom `require` implementation, which was developed by jest, that allows jst to require modules using the `Haste` module system, and because of it reducing the amount of file system operations needed when importing modules which make it fast.

Another thing is that the custom `require` implementation also includes the mocking system, that enables to swap out modules at runtime when calling `jest.mock(🤡)` then at runtime the custom implementation figuring out whether the real module should be required or the mock should be required.

Another thing is while the test framework starts the `jest-runtime` it also initialize the relevant `jest-environment` configured which might be for instance `js-dom` or `nodejs` and then it passed on to the `jest-runtime` which runs all the tests.
