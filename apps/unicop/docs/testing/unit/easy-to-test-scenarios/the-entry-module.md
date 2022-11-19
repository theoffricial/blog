# The Entry Module 🏷️

When exposing an entry module, for a package, a set of internal modules (like React component), etc., All these cases I classify as "The Entry Module" case.

Any entry module is an integral part, in which one or many projects depend on to work.
Many times an entry module has many consumers, so it any change should be made with very high [confidence](../../foundations/confidence.md), think for example about the main module packages like `react` expose.

The good news are that the entry module is always a pure object with a solid structure, so it can easily test with unit tests.

Let's see how to test "the entry module" in practice.

```javascript
// my-highly-used-package-entry-module/index.ts
export * from './x';
export * from './y';
export * from './z';

// my-highly-used-package-entry-module/index.test.ts
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
