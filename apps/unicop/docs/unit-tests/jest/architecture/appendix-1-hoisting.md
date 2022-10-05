# Unit Tests - Jest - Architecture - Hoisting Appendix

hoisting definition,

> JavaScript Hoisting refers to the process whereby the interpreter appears to move the declaration of functions, variables or classes to the top of their scope, prior to execution of the code.
>
> _[MDN Docs](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)_

jest has its own hoist for the declarations of [jest.disableAutomock(🤡)](../mocks/jest-disable-automock.md), [jest.enableAutomock(🤡)](../mocks/jest-enable-automock.md), [jest.unmock(🤡)](../mocks/jest-unmock.md), [jest.mock(🤡)](../mocks/jest-mock.md).

To make the point of jest hoisting clear I'll use my own words, if you ever wondered how jest know to import the mock implementation you defined in the test file, hoisting is a big part of that magic.

:::info
The rest of jest mocking magic explained at [Jest Architecture - The Runtime Environment](./5-the-runtime-environment.md) chapter.
:::

jest hoist a test file during the module transformation step.

:::info
Read more module transformation, at the [Module Transformation](./6-modules-transformation.md) chapter.
:::

jest is using `babel-jest` out-of-the-box, which use Babel behind the scenes, for the hoisting the jest team developed a custom Babel plugin [babel-plugin-jest-hoist][babel-plugin-jest-hoist-link] that `jest-babel` uses.

## Hoisting and Community Transformers

Because jest relies on hoisting to work, community transformers has to support it.

Let's take `ts-jest` for instance, which is a community transformer that is using TypeScript the the transformation technology, implements hoisting.

:::info
Here is hoisting [implementation](https://github.com/kulshekhar/ts-jest/blob/main/src/transformers/hoist-jest.ts) of `ts-jest`, For me it helped to look on how to use it on its own test file [ts-jest/hoist-jest.spec.ts][hoist-jest.spec.ts-link].
:::

[babel-jest-link]: https://github.com/facebook/jest/tree/main/packages/babel-jest
[babel-plugin-jest-hoist-link]: https://github.com/facebook/jest/tree/main/packages/babel-plugin-jest-hoist
[hoist-jest.spec.ts-link]: https://github.com/kulshekhar/ts-jest/blob/main/src/transformers/hoist-jest.spec.ts
