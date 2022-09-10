# Unit Tests - Theory - Low Effort/High Value Cases - The Entry Module 🧭

The entry module case, is when you have a module that highly imported, and breaking changes in it has a huge effect, on your system or your clients/users etc. this is what I called "The entry module" case.

The entry module, like any other module is simple object with some properties, some of them might be functions, complex object or just primitives, it doesn't matter.

Cover this module exported object structure is highly valuable against regressions, typos or inconsistency.

## Where you should use it

- Highly used shared internal modules.
- The entry module of a library you publish/use internally.

## Example

For the example I'm using `jest` but it should be relevant for any testing framework in any language.

```javascript
// my-entry-module/index.ts
export * from './x';
export * from './y';
export * from './z';

// my-entry-module/__tests__/index.test.ts
import * as myEntryModule from '../index';

describe('my-entry-module the entry module test', () => {
  it('should exports the expected object', () => {
    expect(myEntryModule).toMatchObject(
      expect.objectContaining({
        x: expect.any(Function),
        y: expect.any(Object),
        z: expect.any(String),
      })
    );
  });
});
```
