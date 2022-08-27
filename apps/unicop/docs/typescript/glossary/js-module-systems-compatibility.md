## What JavaScript based technology runs what module systems

✅ - Natively | 🧪 - Experimental | 📦 - Module Bundler (e.g. webpack) | 🪅 - 3rd party (e.g. RequireJS)

| Module System  |    Browsers    | Nodejs | <sub><sup>Nodejs based [1]</sup></sub> CLIs |
| :------------: | :------------: | :----: | :-----------------------------------------: |
| Raw `<script>` |       ✅       |        |                                             |
|      AMD       | 🪅 (RequireJS) |        |                                             |
|    CommonJS    |       📦       |   ✅   |                     ✅                      |
|      UMD       |       ✅       |   ✅   |                     ✅                      |
|      ESM       |       ✅       |   🧪   |                     🧪                      |

<sub><sup>[1] - <a href="https://jestjs.io/"><b>jest</b></a> for instance is a Nodejs based CLI</sup></sub>
