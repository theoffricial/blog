# The Complete JS-ecosystem Modules Compatibility 📐

Knowing the popular environments of the JS eco-system (browsers and server runtimes) is highly important to truly master them.
A big part of modern environments is the module systems each supports.

This page is mapping the most popular environments, and share valuable references to good feature mapping exists on the open web.

## Compatibility Table

[esm-mdn]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#browser_compatibility

<table style={{ textAlign: "center" }}>
    <thead>
        <tr>
            <th>Module System</th>
            <th colspan="1">Browsers</th>
            <th width="60%" colspan="3">Server Runtime Environments</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td></td>
            <td>Desktops & Phones</td>
            <td width="60px">Node.js <br />  <b><a style={{ fontSize: "10px", lineHeight: "1" }} href="./nodejs-modules-support">⚙️ using modules article
           </a></b><br />
             <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/nodejs/node?style=flat-square" width="60px"/>
            </td>
            <td>deno<br />  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/denoland/deno?style=flat-square" width="60px" /></td>
            <td>bun <br />  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/oven-sh/bun?style=flat-square" width="60px" /></td>
        </tr>
        <tr>
            <td><b><a href="./esm.md">ESM</a></b></td>
            <td colspan="3">✅ <a style={{ fontSize:"12px", fontWeight: "bold" }} href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#browser_compatibility">See ESM features full compatibility table</a></td>
            <td>✅</td>
        </tr>
        <tr>
            <td><b><a href="./commonjs.md">CommonJS</a></b></td>
            <td>📦</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><b><a href="./umd.md">UMD</a></b></td>
            <td>🪅 (AMD) or 📦 (CommonJS)</td>
            <td>✅ CommonJS</td>
            <td>❌</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><b><a href="./amd.md">AMD</a></b></td>
            <td>🪅</td>
            <td colspan="3">❌</td>
        </tr>
        <tr>
            <td><b><a href="./raw.md">Raw</a></b></td>
            <td>✅</td>
            <td colspan="3">❌</td>
        </tr>
    </tbody>

<br/>

</table>

✅ Full support &nbsp; ❌ Not Supported &nbsp; ⚙️ See implementation notes. &nbsp; <br /> 🪅 3rd party support. &nbsp; 📦 [modules bundler](./modules-bundler.md) support.

---

:::note

Facts you should know:

- ECMAScript 1 - 6 is fully supported in all modern browsers.
- ECMAScript modules (ESM) are the JS eco-system modern standard module system which used by browsers and JavaScript runtimes.

:::

## ECMAScript Support

Here is a list of compatibility tables exists out-there

- **[Compat-table](https://kangax.github.io/compat-table/es6)** - an ECMAScript Features compatibility table for popular environments - Node.js, Browsers both Desktop & Mobile
- **[node.green](https://node.green)** - Focusing on Node.js feature support for the most popular and supported versions.

## See also

#### Definitions of modules-related terms

- **[Node.js Modules Support](./nodejs-modules-support.md)**
- **[ECMAScript Modules (ESM) Explained](./esm.md)**
- **[CommonJS Modules Explained](./commonjs.md)**
- **[AMD Modules Explained](./amd.md)**
- **[UMD Modules Explained](./umd.md)**
- **[Raw Scripts Explained](./raw.md)**
- **[Modules Bundler](./modules-bundler.md)**

#### More definitions of related terms

- **[Environment](../environment.md)**
