---
pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 03/09/2022
  author: Ofri Peretz
---

# How-To-Use Jest Environments 🧫

Before you continue, please make sure you are familiar with the following terms:

1. [What an environment is](../../../../foundations/environment.md)
1. [What a test environment is](../../../../testing/foundations/test-environment.md)

---

Jest supports 2 environments out-of-the-box:

1. [jest-environment-node](https://github.com/facebook/jest/tree/main/packages/jest-environment-node) - for compatibility with Nodejs code
2. [jest-environment-jsdom](https://github.com/facebook/jest/tree/main/packages/jest-environment-jsdom) - for compatibility with browsers code

:::info

[jsdom](https://github.com/jsdom/jsdom) is a pure-JavaScript implementation of many web standards, notably the WHATWG [DOM](https://dom.spec.whatwg.org) and [HTML](https://html.spec.whatwg.org/multipage) standards, for use with Nodejs. The goal of jsdom is to emulate enough of subset of a web browser to be useful for testing and scraping real-world web applications.

:::

> A test environment is the environment that will be used for testing. The default environment in Jest is Node.js environment. If you are building a web application, you can use a browser-like environment through jsdom instead.
>
> [_Jest Docs_](https://jestjs.io/docs/configuration#testenvironment-string)

:::info

FYI jest also supports custom environments. Personally I've never used it, but [here](https://jestjs.io/docs/configuration#testenvironment-string) a reference to the relevant place in Jest docs.

:::

The test environment is config-based and should be explicitly configured if you use something else than the defaults.

You can configure it in various ways:

1. Using config using the [testEnvironment](https://jestjs.io/docs/configuration#testenvironment-string), and the [testEnvironmentOptions](https://jestjs.io/docs/configuration#testenvironmentoptions-object).

1. Using inline JS docblock.

1. Using the CLI [--env=\<environment\>](https://jestjs.io/docs/cli#--envenvironment) option

## Examples

### Using Config

```ts
// jest.config.js example

// node example
module.exports = {
  testEnvironment: 'node', // default
};

module.exports = {
  testEnvironment: 'jsdom', // a browser-like environment for web apps
  testEnvironmentOptions: { // # optional
    html: "<html lang="zh-cmn-Hant"></html>",
    url: 'https://jestjs.io/',
    userAgent: "Agent/007"
  }
};
```

### Using CLI

The test environment used for all tests. This can point to any file or node module.

```bash
jest --env=jsdom # Browsers code compatibility
jest --env=node # Default, node compatibility
jest --env=path/to/my-environment.js # custom env
```

### Using Inline Codeblock

By adding a `@jest-environment` docblock at the top of the file, you can specify another environment to be used for all tests in that file:

Simple example:

```ts
// my-test-file.test.[jt]s
/**
 * @jest-environment jsdom
 */

test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});
```

Adding environment options example:

```ts
/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://jestjs.io/"}
 */

test('use jsdom and set the URL in this test file', () => {
  expect(window.location.href).toBe('https://jestjs.io/');
});
```

Using custom environment example:

```ts
/**
 * @jest-environment ./src/test/my-custom-environment
 */

test('use custom example that has global "x" property', () => {
  expect(global.x).toBe(42);
});
```

## See also

### Software Foundations 🏗️

- [Environment 🏷️](../../../../foundations/environment.md)

### JS ecosystem > Foundations 🏗️

- [JavaScript Engine 🏷️](../../../foundations/js-engine.md)

### Testing > Foundations 🏗️

- [Test Environment 🏷️](../../../../testing/foundations/test-environment.md)
