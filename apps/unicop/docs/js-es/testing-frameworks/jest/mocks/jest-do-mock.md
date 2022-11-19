# jest.doMock(modulePath, factory, options)

jest.doMock(...) enables you to have a "scoped" mock, in contrary to **[jest.mock(modulePath, factory)](./jest-mock.md)** that mocks globally.

And I quote

> When using babel-jest, calls to mock (`jest.mock()`..) will automatically be hoisted to the top of the code block. Use this method if you want to explicitly avoid this behavior.
>
> [_Jest Docs_](https://jestjs.io/docs/jest-object#jestdomockmodulename-factory-options)

Because it is a scoped mock, only imports after the `jest.doMock` statement, will resolved as the mocked version of the module.

It is useful when you want to mock only a specific test.

See a basic example

```js
beforeEach(() => {
  jest.resetModules();
});

it('test myModule 1', () => {
  jest.doMock('../myModule', () => {
    return jest.fn(() => 1);
  });

  const myModule = require('../myModule');
  expect(myModule()).toBe(1);
});

// async-await example
it('test myModule 2', async () => {
  jest.doMock('../myModule', () => {
    return jest.fn(() => 2);
  });

  const myModule = require('../myModule');
  expect(myModule()).toBe(2);
});
```

## Use jest.doMock(..) with [ESM][unicop-esm]

`
This section is how to use an ESM module when you aren't using the **[transform](../transform.md)** option.

To use `jest.doMock()` with [ESM][unicop-esm] requires the following steps:

1. When using the `factory` option for an ESM module with a `default export`, the `__esModule: true` needs to be specified.
2. Static ESM imports are hoisted to the global scope, so to import them after the `jest.doMock()`, we need to use the dynamic import syntax `import()` which returns `Promise` with the module.
3. Also we need an environment that can support the `import()` dynamic syntax, which is natively not supported by Jest, you can use `Babel` and the [babel-plugin-dynamic-import-node](https://npmjs.com/package/babel-plugin-dynamic-import-node) which transpile the `import()` to a deferred `require()` for NodeJS.

```js
beforeEach(() => {
  jest.resetModules();
});

it('promise-then test example 1', () => {
  jest.doMock('../myModule', () => {
    return {
      __esModule: true,
      default: 'default-mock',
      foo: 'foo-mock',
    };
  });

  import('../myModule').then((myModule) => {
    expect(myModule.default).toBe('default-mock');
    expect(myModule.foo).toBe('foo-mock');
  });
});

// async-await example
it('async-await test example 2', async () => {
  jest.doMock('../myModule', () => {
    return {
      __esModule: true,
      default: 42,
      foo: 50,
    };
  });

  const myModule = await import('../myModule');

  expect(myModule.default).toBe(42);
  expect(myModule.foo).toBe(50);
});
```

[unicop-esm]: ../../../foundations/modules/esm.md
