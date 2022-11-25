# Appendix Ⅶ: What is "Haste"? 👾

## Introduction ✨

In Jest, "Haste" is being used through [Part 2. FS & Build Dependency Graph 🕸](./part-2-dependency-resolutions.md)

But you might wondered where the name "Haste" comes from.

Let me take you to the glory days of Facebook (Meta) at around 2010, Where the company was on its way to the top, and its engineering department influenced the entire ecosystem, and I wish I could be part of that scene.

## What is "Haste"? - Historical Brief 🦕

HasteMap is a JavaScript implementation of Facebook's haste module system developed at around 2010 and used internally at Facebook (Meta) in the times before any other module system exist, before the era of [CommonJS](../../../foundations/modules/commonjs.md)/[ESM](../../../foundations/modules/esm.md)/[AMD](../../../foundations/modules/amd.md)/[UMD](../../../foundations/modules/umd.md).

The `jest-haste-map` implementation inspired by https://github.com/facebook/node-haste and was built for high-performance in large code repositories with
hundreds of thousands of files which Facebook had at the time haste developed.
This implementation is scalable and provides predictable performance.

The idea of how "Haste" works is that Facebook used to manage all their codebase at a single huge project, and all the different modules were under a folder called `html/js`.

### Haste Evolution

So what they did was to add an header to each file, like this [one](https://github.com/facebook/fbjs/blob/main/packages/fbjs/src/dom/BrowserSupportCore.js#L7) that provides the unique name associates with that module, and was inside the file, the module name is global, it means that you could not provide the same name for 2 modules, although it might happened and also that no relative path was needed like the present module systems (as long as you don't use an alias), these relative paths can be sometimes really long and exhausting.

So in Hate instead of using `../my/relative/path/to/my-module.js`, you just had to call `my-module`.

Later on, instead of using declarative headers inside files, the implementation had changed to take the file-path/ name as the unique identifier. That way Facebook avoided to read the content of files for the modules list, but only for the step of building the tree of dependencies resolution, so it improved performance.
