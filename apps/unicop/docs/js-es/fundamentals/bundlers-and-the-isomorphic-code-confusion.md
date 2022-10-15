---
pagination_prev: js-es/fundamentals/index
pagination_next: null
last_update:
  date: 03/09/2022
  author: Ofri Peretz
authors: [unicop]
---

# JS Isomorphic Code Confusion 🔮

According for 2022, we still in an area where it is crucial to be familiar with the JS eco-system history, but still many developers not truly familiar with.
The most obvious and real example for that would be that JavaScript has 4 different module systems (raw, AMD, CommonJS, and ESM), and this after I excluded UMD!

It causes lack of understanding what module systems browsers compatible, and what NodeJS is.
But why it happened? Because the NodeJS ecosystem initially started as a separate ecosystem which means that code that was written for NodeJS wasn't compatible with browsers, and couldn't used by browsers, until packages bundlers.
Since packages bundlers tools like browserify and webpack, and later on parcel, rollup, esbuild, etc. appeared and enabled CommonJS modules (NodeJS code) to work smoothly in browsers, the scene of isomorphic code, which runs both under NodeJS and the browser, has exploded.

Since the era of packages bundlers the "confusion" went two step further,
The first step is when the JS eco-system tools like create-react-app or vitejs appeared, these frameworks are good to get started to develop new projects, by using the packages bundlers tools under-the-hood and do the hard work for you, but also caused many developers and organizations to be lazy and learn how the magic happens. <br/>
This was probably the natural way for the eco-system to grow, it made web applications be more accessible for many more people. <br/>
These tools let us avoid the exhausting job of configuring packages bundlers that require advance knowledge.
The second step is the appearance of different transpilers such as TypeScript and Babel, that enable types and support of different JavaScript (or ECMAScript) versions between development and production.

With all upsides these tools benefit us, The downsides are promotion of ignorance how things work by the abstractions of packages bundlers and frameworks, and also more complexity by transpilers that requires build steps.

From my own experience, I confidently write that the module systems and compatibility isomorphic code confusion <br/>
is the number one root-cause of issues during development.

But the good thing is that understanding it, <br/>
I would confidently state is the best thing you can do to become a better JavaScript (and all of its tools) developer.

## Learn how things work and stop the isomorphic code confusion

I already publish content that can help you understand it better, and more is coming.

- **[All JavaScript Module Systems Explained 🫀](./javascript-module-systems-explained.md)**
- **[Compatibility Table 📐](./js-module-systems-compatibility.md)** - Includes references

<!-- and what modules browsers and NodeJS are compatible with.
This lack of understanding prevent developers to understand how things work, and this knowledge can help many of the issues developers experience on a daily basis.

How the JS eco-system developed is unlike any other programming language,
It advanced fast and in arbitrary direction, an obvious proof is the existence of 4 (not including UMD) [module systems](./javascript-module-systems-explained.md).

Telling you that to let you understand the root-cause of the isomorphic code confusion among developers

The less obvious complication is browser compatibility.
The NodeJS ecosystem initially started as a separate ecosystem, but since tools like Browserify and webpack enabled CommonJS modules to be used in the browser, the scene of isomorphic code, which runs both under NodeJS and the browser, has exploded.

The less obvious complication is browser compatibility.

Both Browsers and The NodeJS ecosystems initially started separate, but since packages bundlers tools like `webpack`, `parcels`, `rollup` and others enabled CommonJS modules to be used in the browser, the scene of isomorphic code, which runs both under NodeJS and the browser, has exploded.
Which caused everything to mixed up but where conflicts happens from time to time.

This is why `Transpilers` in the JS eco-system are so fundamental component, so let's understand what are they compared to compilers.

## TypeScript And NodeJS Isomorphic Code Confusion -->

## Isomorphic Code Confusion Common Errors ⛔

Bugs explained

- [TypeScript Jest Resolved "Cannot use import statement outside module"](../typescript/bugs-solved/typescript-jest-cannot-use-import-statement-outside-module.md)
- more are coming

## References 🔗

- Gil Tayar - [Native ES Modules in NodeJS: Status And Future Directions, Part I](https://medium.com/@giltayar/native-es-modules-in-nodejs-status-and-future-directions-part-i-ee5ea3001f71)
