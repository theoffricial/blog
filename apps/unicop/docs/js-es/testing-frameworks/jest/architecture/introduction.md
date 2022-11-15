---
pagination_prev: null
---

# Introduction ✨

Happy to introduce you the 6-parts series of jest which explains you step after step how jest works,
Every concept is explained in high-level, but also drill down into the technical details.

My motivation for writing this series was that during the last year I took a challenge to take the testing domain at [Snappy](https://www.linkedin.com/company/snappy-app/) to the next level, and jest takes a place of honor to make it happen.

I think jest implementation is inspiring, and so besides understanding how jest works, in this series I would recommend to pay attention how modular jest is, and how it is being implemented.
In fact, some of jest core modules are being used in many technologies and affects the entire eco-system.

Although I cover jest architecture much more in detail, I invite you to see the official [jest architecture video](https://jestjs.io/docs/architecture) which made by one of jest's founders, that said:

> Jest’s packages make up an entire ecosystem of packages useful for building any kind of JavaScript tooling.
> “The whole is greater than the sum of its parts” doesn’t apply to Jest!
> **_[Christoph Nakazawa](https://twitter.com/cpojer)_**

<br />

import DocCardList from '@theme/DocCardList';
import { useCurrentSidebarCategory } from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items} />

<!-- ### Navigation

|      #       | Navigation List                                                             |
| :----------: | :-------------------------------------------------------------------------- |
|    Intro     | **[Introduction ✨](./introduction.md)** &nbsp; 👈&nbsp; You are Here     |
| Full Diagram | **[Full Architecture Diagram 🏛](./the-complete-architecture.md)**              |
|    Part 1    | **[Configs 🧰](./part-1-configs.md)**                                            |
|    Part 2    | **[File System & Dependency Resolution 🌳](./part-2-dependency-resolutions.md)** |
|    Part 3    | **[Test Order Optimization ⏳](./part-3-test-run-order.md)**       |
|    Part 4    | **[Test Run 🃏](./part-4-test-run.md)**                                     |
|    Part 5    | **[The Runtime Environment 💽](./part-5-the-runtime-environment.md)**            |
|    Part 6    | **[Module Transformation 🦠](./part-6-modules-transformation.md)**               |
|  Appendix Ⅰ  | **[Jest Hoisting 🆙](./appendix-1-hoisting.md)**                            |
|  Appendix Ⅱ  | **[jest-worker 👷‍♂️](./appendix-2-jest-worker.md)**                           |
|  Appendix Ⅲ  | **[Cache Summary 💵](./appendix-3-cache-summary.md)**                       |
|  Appendix Ⅳ  | **[Test Result Summary 🧪](./appendix-4-reporters.md)**           |
|  Appendix Ⅴ  | **[Watch Mode ⏱](./appendix-5-watch-mode.md)**                              | -->
