# JavaScript Modules Compatibility 📐

Familiarity with the common tools compatibility clarify what is allowed and how it can be used correctly. <br/>
Here is a short version of the different JS modules compatibility with some references to more detail sites.

---

✅ - **Native Support** <br/>
🧪 - **Experimental Support** <br/>
📦 - **Module Bundler** (e.g. webpack) <br/>
🪅 - **3rd party** (e.g. RequireJS) <br/>
❌ - **Not Supported**

---

| Module System  |    Browsers    | Nodejs | <sub><sup>Nodejs based [1]</sup></sub> CLIs |
| :------------: | :------------: | :----: | :-----------------------------------------: |
| Raw `<script>` |       ✅       |   ❌   |                     ❌                      |
|      AMD       | 🪅 (RequireJS) |   ❌   |                     ❌                      |
|    CommonJS    |       📦       |   ✅   |                     ✅                      |
|      UMD       |       ✅       |   ✅   |                     ✅                      |
|      ESM       |       ✅       |   🧪   |                     🧪                      |

<sub><sup>[1] - <a href="https://jestjs.io/"><b>jest</b></a> for instance is a Nodejs based CLI</sup></sub>

## More about JS Modules

To understand what defines each module system and how it works, <br/> Read my other paper - **[JavaScript Module Systems Explained 🫀][js-module-explained]**.

## References 🔗

- **[MDN JavaScript Modules][mdn-js-modules]** - includes compatibility per browsers in detail.
- **[node.green][node-green]** - NodeJS Full and clear compatibility of all most popular versions.

[mdn-js-modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[node-green]: https://node.green/
[js-module-explained]: ./javascript-module-systems-explained.md
