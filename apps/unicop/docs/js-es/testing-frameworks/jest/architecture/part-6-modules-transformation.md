# Part 6. Module Transformation

## Introduction ✨

### Prerequisite Terms 🔓:

If you want to fully understand this article, make sure to be familiar with the following:

- [What isomorphic code is](../../../foundations/bundlers-and-the-isomorphic-code-confusion.md)
- [JS-ecosystem module systems](../../../foundations/javascript-module-systems-explained.md)
- [Node.js module system compatibility](../../../foundations/modules/nodejs-modules-support.md)
- [Transpiler and Code Transpilation](../../../foundations/transpiler.md)

On [Part 5.](./part-5-the-runtime-environment.md) on the step of building an isolated sandbox to run test files (at the `jest-runtime` module) I mentioned a module transformation sub-step where Jest convert modules from one form into another form.

I think this "sub-step" worth focusing to explain what module transformation basically is, and why is it necessary in Jest.

## Jest Module Transformation Explained

Basically it means the exact same thing as transpilation.
Jest transformers are transpilers, and as transpilers they take JS/TS/etc. code from one version and convert it to another version.

Where the "another version" in Jest means the target version is CommonJS module, or if Node.js is defined to work with ES modules so the target version is ESM.

By default Jest is using [Babel](https://babeljs.io) as transformer, using the `babel-jest` package that includes some custom babel plugins, like the jest hoist plugin, to transpile Jest test files to compatible with Jest capabilities.

:::note

Read more about jest hoisting on my architecture series [Appendix Ⅰ: Jest Hoisting](./appendix-1-hoisting.md).

:::

## Why Jest Module Transformation is Necessary

Jest is a Node.js-based CLI, which compatible only with [CommonJS](../../../foundations/javascript-module-systems-explained.md) modules. It limits Jest to run any code that is using different module system, e.g. [ES modules](../../../foundations/javascript-module-systems-explained.md),
or [isomorphic code](../../../foundations/bundlers-and-the-isomorphic-code-confusion.md) projects, like most modern web applications.

The Jest team wanted Jest to be capable to work on different environments and be compatible to the modern JS eco-system where many projects are isomorphic or their dependencies are isomorphic, or to support testing projects that are written in languages that extends JavaScript capabilities, like TypeScript.

Jest as you may or may not know, supports all of the examples above, thanks to module transformation.

:::note

The `transform` config option is responsible to customize the Module Transformation action at runtime.
This article is focus on architecture, so if you wish to learn how to use the `transform` option, See my [Jest How-to-Use Transform](../how-to-use/transform.md) article.

:::

## Why Jest Module Transformation Happens During Runtime

The module transformation execution is happening synchronously "just-in-time" (lazy loading), when the actual test file being loaded.

In detail, It means that Jest's dependency graph keep files in their original form, and the transformation is only happening once the `jest-runner` is running a test file, it transforms the test file itself and look for its dependency graph to transform its dependencies and so on.

Why this approach picked? Not entirely sure, but The simple answer is that transform all module asynchronously required the Jest team to change Jest architecture, and both approaches has pros and cons, so decided to stick with the "just-in-time"/lazy approach.

## Module Transformation - Cache & Performance

The transformation is an expensive part of the test run.

According to the Jest founder @christoph mentioned in his architecture video, transformation is often takes more than 50% of the entire test run.

That's why jest cache both source form modules, and the transformed modules.

So when measuring test run, keep in mind to always evaluate the initial run separately than invocations where cache is available.

:::note

If you are interested how the transformation looks like in the code,
Here are some highlights references for you:

- [Jest - Execute a module](https://github.com/facebook/jest/blob/main/packages/jest-runtime/src/index.ts#L1390-L1503) - Here you can see how transformation is an integral step in executing a module
- [Transform a file](https://github.com/facebook/jest/blob/main/packages/jest-runtime/src/index.ts#L1505-L1571) - How module transformation is being done

:::

## Outroduction 👋

That's it!
You've just completed reading my Jest architecture series, I hope you enjoyed, and inspired.
