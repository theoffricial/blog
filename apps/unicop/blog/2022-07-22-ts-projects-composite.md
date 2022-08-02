---
slug: typescript-projects-composite
title: TypeScript - Faster Builds with Incremental Composite Projects ⚡️
authors: [unicop]
tags: [TypeScript, Optimize, Unknown]
---

## Intro

TypeScript 3.4 released a new feature call "[TypeScript Projects References]"

So why do we need the TypeScript Projects References feature released on TypeScript 3.4 ?

<!--truncate-->

<!-- <details>
    <summary>TL;DR ⚡️</summary>

    1. Add to your <code>tsconifg.json</code> <code>compilerOptions.importHelpers</code> to <code>true</code>.

<br/>

2. Install <code>tslib</code> as <code>dependency</code> for applications, and as <code>peerDependency</code> + <code>devDependency</code> for libraries.

</details> -->

If you are here, you might have already experienced that as the project gets bigger, running `tsc` takes longer,
and you are looking for ways to optimize its running time!
If so this article is for you.

## Why 💡

We want to make our builds to complete running much faster, in other words optimizing the build process.

## How 🤯

TypeScript is just join late to the party!
Many other languages' compilers/transpiler already support abilities of collecting data about previous builds or building dependencies graph, so the next build can be optimized.

So now TypeScript has such mechanism.

## What 🤔

on [TypeScript 3.4][typescript-3.4], there is a new feature call `TypeScript Projects References` that enables TypeScript to work with incremental builds,
Basically it means, that when this feature is configured, TypeScript collects data about builds to become smarter, and build next time smaller parts that it detected as "might affected".

## The Issue 🦚

When we run `tsc` in compiles every each one of the modules in the project,
rather if the project has 5 modules or 5,000 modules.
It means that an internal part[2] of the build time is linear,
to the number of lines of code in the project, which is not scalable.

[2] - "an integral part" and not completely linear,
because there is an initial cost that is more expensive that happens before transpilation.
So when summing:
command initial + type-check + emit-changes (transpile) = more than linear.

<!-- :::warn
Anything that is linear or more expensive, is not scalable.
We developers, get paid to develop products that duplicate them cost much less than linear.
::: -->

Another argument which I find weaker from my experience,
but worth mentioning is that optimizing building execution time also reduces CI pipeline.

## The Solution 🛠

First let me introduce the example project for today,
then I'll go through the details

```
// <link to repo>
.
├── tsconfig.json // manages reference projects
├── tsconfig.base.json // baseline for projects' tsconfig.json
├── package.json
├── node_modules
│   └── ...
├── src
│   ├── wonderland // DEPENDS ON: creatures, shared
│   │   ├── initial-wonderland.ts
│   │   └── tsconfig.json
│   ├── creatures // DEPENDS ON: NONE
│   │   ├── cheshire-cat.creature.ts
│   │   ├── creature.interface.ts
│   │   ├── white-rabbit.creature.ts
│   │   ├── index.ts
│   │   └── tsconfig.json
│   └── formating // DEPENDS ON: creatures
│       ├── format-how-creature-say-hello.ts
│       └── tsconfig.json
├── build
│   ├── wonderland
│   │   ├── initial-wonderland.js
│   │   ├── initial-wonderland.d.ts
│   │   └── tsconfig.tsbuildinfo
│   ├── creatures
│   │   ├── cheshire-cat.creature.js
│   │   ├── cheshire-cat.creature.d.ts
│   │   ├── creature.interface.js
│   │   ├── creature.interface.d.ts
│   │   ├── white-rabbit.creature.js
│   │   ├── white-rabbit.creature.d.ts
│   │   ├── index.js
│   │   ├── index.d.ts
│   │   └── tsconfig.tsbuildinfo
│   └── formating
│       ├── format-how-creature-say-hello.js
│       ├── format-how-creature-say-hello.d.ts
│       └── tsconfig.tsbuildinfo
└── ...
```

Most important things to notice

- On top-level the project has `tsconfig.json`, and `tsconfig.base.json`
- The project `src` code contains 3 main directories, `creatures, formmating, and wonderland`
- Each of the directories mentioned on the first bullet has `tsconfig.json` of its own
- The `build` (`tsc` output) directory contains similar directories to `src` with `.js`s and `.d.ts`s files, but also file call `tsconfig.buildinfo`

Let's deep dive into

### Top-level `tsconfig.json`

```ts reference title="<rootDir>/tsconfig.json"
https://github.com/unicop-art/typescript-projects-references-example/blob/main/tsconfig.json#L1-L40
```

```ts reference title="<rootDir>/tsconfig.base.json"
https://github.com/unicop-art/typescript-projects-references-example/blob/main/tsconfig.base.json#L1-L40
```

## What you should do 💎

- Have a main `tsconfig.json` that only in charge of referencing the project
- Have another `tsconfig.base.json` on the root-level that contains the base line of how all the projects' are going to be configured.
- On each "project" you define
  - Add a reference of the new "project" on the main `tsconfig.json`
    - Set `path` to its main directory, where the `tsconfig.json` placed
  - On the "project" main directory, add new `tsconfig.json`
    - Make sure it is `extends` `tsconfig.base.json`
    - Set the `outDir` to the relevant place
      - e.g. if my project is on dir `my-project`, make sure the `outDir` is to `<root-dir>/dist/my-project`

<!-- It mainly affects on the development, because if you are developing on `watch mode` to get quick feedback for your changes it matters if for every small change you need to wait 1 second or 10 seconds.

10 second or more for build is annoying, exhausting and cause developers to lose focus, because who doesn't open the smartphone or move to Slack while waiting for the build to finish...

First and foremost, most of the time

to answer this questions on the next time `tsc` will run:

"What parts of my code might be affected by the current changes I just did, So I can build them only and be safe.".

based on dependencies graph between different "projects", which I will describe in the sections below.

mechanisms developed methods to collect insights about what they consistently build to build it smarter.

It is an issue especially during development where you want to be on a `watch` mode for hot reloading of the output, the

every time you run `tsc` It happens because by default TypeScript has no mechanism that maps the different relationships between modules in the same project, such mechanisms are the key does not taking into account previous builds, so for instance in a `watch` mode which is common, for every small change the whole project will re-transpile.

that enables to build the next builds smarter (like a cache mechanism)

The `tsc` (TypeScript compiler) transpilation is known as an expensive task. Developers mainly experience long waits between builds during development, when the `tsc` command starts to execute for 10s and more.
It slows down development, pipelines and so on, and generally speaking inefficient.

While for most of teams and companies this issue won't be a top priority for the next quarter, but all will agree it will improve their development experience dramatically.

It happens mainly because, TypeScript, by default, doesn't support advanced abilities such as smart caching, incremental builds and so on. -->

## How 🤯

I'm not sure of the exact reason to support it, but probably because many users have raised this issue, The TypeScript team has released an exciting support in incremental builds on [TypeScript 3.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html) and above.

## What 🤔

The new feature call `TypeScript Projects References`,
Adding some new configurations to your project.

In the form of `TypeScript Projects References` feature, which simply divides a single TypeScript project into small ones, and by adding some build orchestration tools and build information files, TypeScript can build now projects' dependencies graph that knows when a project should be re-transpile according to changes that happened.

Let's see how

`tsconfig.json` (The main project's TypeScript configuration file).

- The top-level property `references`
- New tsconfig.json for each defined project
- Some `compilerOptions` like `composite`

---

## The issue 🦚

## The Solution 🛠

## What you should do 💎

## Recommendations 🙌

<!-- - The TypeScript team is recommending it on the `tslib` readme, and I will quote -->

> For optimized bundles with TypeScript,
>
> you should absolutely consider using `tslib` and `--importHelpers`.
>
> — [TypeScript Team](https://github.com/Microsoft/tslib#tslib)

<br/>
I Hope you've enjoyed the reading 🙏❤️

## Sources 🔗

More detailed

- [TypeScript Project References Official Doc](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TypeScript 3.4 Release Note](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#faster-subsequent-builds-with-the---incremental-flag) - Explained more in details about `composite` projects and `incremental builds`, and how it is being done in TypeScript.

Configurations

- [TypeScript Incremental flag](https://www.typescriptlang.org/tsconfig#incremental)
- [TypeScript composite flag](https://www.typescriptlang.org/tsconfig#composite)
- [TypeScript tsBuildInfoFile path](https://www.typescriptlang.org/tsconfig#tsBuildInfoFile)

[typescript-3.4]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
