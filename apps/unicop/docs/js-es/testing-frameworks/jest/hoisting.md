# Unit Tests - Jest - Hoisting

If you are not familiar what hoisting is,

> JavaScript Hoisting refers to the process whereby the interpreter appears to move the declaration of functions, variables or classes to the top of their scope, prior to execution of the code.
>
> _[MDN Docs](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)_

Jest does something very similar for the declarations of [jest.disableAutomock(🤡)](./mocks/jest-disable-automock.md), [jest.enableAutomock(🤡)](./mocks/jest-enable-automock.md), [jest.unmock(🤡)](./mocks/jest-unmock.md), [jest.mock(🤡)](./mocks/jest-mock.md), but because jest can't compete with the JavaScript interpreter because it runs after jest does, it simply scope the whole module, and move the hoisted jest declarations into the parent scope to achieve the desired result, prior to the JavaScript interprete execution.

Whether you you like it or not, this is how jest works.

## How jest transform modules to support the jest hoisting

Jest has many internal packages that each is in charge to different capability, but in this process I will mention 3 main ones

### [babel-jest](https://github.com/facebook/jest/tree/main/packages/babel-jest)

Jest's out of the box transformer, which uses Babel to enable using syntax not supported by Node out of the box.

jest does it by using the `/\.[jt]sx?$/` pattern implicitly by default.

Read more about **[jest transform](./transform.md)**

The `babel-jest` also included `babel-plugin-jest-hoist`.

### [babel-plugin-jest-hoist](https://github.com/facebook/jest/tree/main/packages/babel-plugin-jest-hoist)

This Babel plugin is in charge to hoist the jest declarations I mentioned above, and place their calls above import statements.

### [jest-haste-map](https://github.com/facebook/jest/tree/main/packages/jest-haste-map)

This package map all modules for jest, by correlate the module name as the key to the actual module after the transformation done by babel-jest.
It also initial the jest module scanning, but the scanning is done by [fb-watchman](https://www.npmjs.com/package/fb-watchman).
