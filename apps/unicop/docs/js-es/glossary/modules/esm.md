# ESM

:::note
🔙 to **[Modules Summary](./summary.md)**.

:::

ECMAScript Modules, or ESM are the official standard format to package JavaScript code for reuse. Modules are defined using a variety of `import` and `export` statements.

The following example of an ES module exports a function:

```js
// addTwo.js
function addTwo(num) {
  return num + 2;
}

export { addTwo };
```

The following example of an ES module imports the function from addTwo.mjs:

```js
// app.js
import { addTwo } from './addTwo';

// Prints: 6
console.log(addTwo(4));
```

:::note
PAY ATTENTION, TypeScript `import` and `export` statements, look the same, does pretty much the same, but are different thing than native `import` and `export` statements.

:::

## See also

### Modules

- [Modules Compatibility](./modules-compatibility.md)
- [Node.js Modules Support](./nodejs-modules-support.md)
