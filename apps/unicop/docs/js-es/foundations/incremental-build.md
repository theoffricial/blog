# Project Incremental Build 🧩

Project incremental build refers to build tools that capable to look at a project as a set of components that compose it for the build purposes, and during this break down to log this map as information to use it for future builds, so when a `build` command would be requested again, the build tool will read the logged data from previous build, and figure out what has changed and re-build only those files/modules/components which defined as affected from changes.

The incremental build comes as an enhancement to [naive build](./incremental-build.md), which is more expensive when building a project often, for example during development or in a deployment pipeline.

:::note

The incremental build is a derivative of an older development model call the incremental build model, [here its wikipedia](https://en.wikipedia.org/wiki/Incremental_build_model) definition.

The build tools' incremental build is a reverse engineering to the model.
Because developers build projects as a single piece and the build tool figures out how to break it down into smaller pieces for efficiency purposes.

:::

Now let me share with you a common pattern build tools use.

## A Common Pattern Build Tools Use to Implement Incremental Build

A common pattern build tools use to implement incremental build:

1. Crawl the project's file system and list all files
1. Static analysis the file list to get the dependencies graph between the files/modules/components
1. Logging both files and modules in a file or in cache (every build tool has its own format).
1. On the next time build requested, the build tool figures out what files has changed and according to the logged data finds what it should re-build, and what it can leave as it is.

## Build Tools, Watch-mode and Incremental Builds

First watch-mode can be also called continuos build processes.

Today, build tools that support watch-mode, they might not state it explicitly but because of the nature of watch-mode build tools implement incremental builds optimizations to improve the user experience while developing in watch-mode.

## See also

### TypeScript

- [TypeScript > Incremental Build](../typescript/optimizations/incremental-build.md)

### JS ecosystem Foundations 🏗️

- [Compiler](./compiler.md)
- [Modules Bundler](./modules/modules-bundler.md)
- [Project Naive Build](./naive-build.md)
- [Transpiler](./transpiler.md)
