# Appendix Ⅵ: Jest Test Frameworks Evolution

When Jest has released, it used `jasmine` under the hood to actually run tests and process their results (the `jest-runner` module was responsible for running tests, and still does.).

:::note

_Clarification_: Jest is basically using the custom `Globals`, then call them `Jest Globals`, the test framework provides, e.g. `describe(🤡)`, `test(🤡)`, `beforeEach(🤡)`, and so on, which are in charge to interpret the executed test file, then run their callbacks while processing the test-file's test result. That's it.

:::

Although it worked, the jest team found `jasminse` too heavy as-is because jest has its own implementations for some of `jasmine` capabilities, and also doesn't use other features `jasmine` supports.

That's why the `jest` team took `jasmine` and striped all parts they found redundant for Jest, and built a light version they called `jest-jasmine2`, which is under the Jest monorepo, and started to use Jest with the `jest-jasmine2` package.

While working on crafting the `jest-jasmine2` package, they also worked on a whole new test framework package called `jest-circus`.

The `jest-circus` is compatible to the `jasmine` API, but differently its architecture which is [flux](https://facebook.github.io/flux/docs/in-depth-overview)-based, when managing a state that being dispatch after actions like running a new test suite.

Christoph Nakazawa, one of Jest founders, stated in his Jest architecture video, that `jest-circus` should be faster than `jest-jasmine2`.

:::note

> As of Jest 27, `jest-circus` is jest default test framework and comes out-of-the-box with no extra configuration.
>
> _[jest-circus README](https://github.com/facebook/jest/tree/main/packages/jest-circus#installation)_

:::

:::note

References for both test frameworks:

[jest-circus](https://github.com/facebook/jest/tree/main/packages/jest-circus)
[jest-jasmine2](https://github.com/facebook/jest/tree/main/packages/jest-jasmine2)

:::
