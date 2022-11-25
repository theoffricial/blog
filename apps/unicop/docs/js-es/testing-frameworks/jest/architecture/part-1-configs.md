---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 03/09/2022
  author: Ofri Peretz
---

# Part 1. Configs 🧰

## Introduction ✨

Welcome to the first part in the series, which discusses how Jest figures out its execution configuration.

Jest supports several configuration types, like CLI arguments, configuration files, and inline codeblock configuration.

:::note
The inline codeblock configuration isn't cover here, but you can see a real example at my [Jest, How-to-Use Environments](../how-to-use/environments.md#using-inline-codeblock) article.
:::

Let's examine what happens once we run Jest through the CLI:

```bash
jest <my-test-pattern> [argv]

```

Once execution starts, Jest tries as a first thing to figure out "How exactly should I run?".

To answer that question, Jest starts looking for its different configuration types.

Jest looks for configuration using the `jest-config` dedicated module for it.

And what it does is simple,

1. It parses the CLI arguments (`argv`) passed together with Jest CLI.
2. It Looks for dedicated configuration files like the `jest.config. js`, or for the `"jest"` key in the `package.json`.

:::note
jest supports passing a custom configuration file path through CLI using [--config=<path\> [-c]](https://jestjs.io/docs/cli#--configpath) option. <br/>
It tells Jest to look for configuration file in the custom path, instead at the project root directory.
:::

`jest-config` is built from 2 main modules, reading, and parsing all configuration types, and normalizing all together into a final configuration objects for [run-time](../../../../foundations/run-time.md).

## Part 1: Configs Diagram ✍️

import JestArchitectureSVG from './svg/part-1-configs.svg';

<JestArchitectureSVG />

## Reading, and Parsing Configurations

### Step 1: Collecting the CLI options

jest [extract](https://github.com/facebook/jest/blob/e21c5aba950f6019bbfde2f8233ac96d1fcaef42/packages/jest-cli/src/cli/index.ts#L51) all CLI argument into an object using the [yargs](https://github.com/yargs/yargs) package.

:::note
See [Jest CLI Options](https://jestjs.io/docs/cli)
:::

```js
// packages/jest-cli/src/cli/index.ts#L51
export async function buildArgv(
  maybeArgv?: Array<string>,
): Promise<Config.Argv> {
  const version =
    getVersion() +
    (__dirname.includes(`packages${path.sep}jest-cli`) ? '-dev' : '');

  const rawArgv: Array<string> = maybeArgv || process.argv.slice(2);
  const argv: Config.Argv = await yargs(rawArgv)
    .usage(args.usage)
    .version(version)
    .alias('help', 'h')
    .options(args.options)
    .epilogue(args.docs)
    .check(args.check).argv;

    validateCLIOptions(
      argv,
      {...args.options, deprecationEntries},
      // strip leading dashes
      Array.isArray(rawArgv)
        ? rawArgv.map(rawArgv => rawArgv.replace(/^--?/, ''))
        : Object.keys(rawArgv),
    );

  // strip dashed args
  return Object.keys(argv).reduce<Config.Argv>(
    (result, key) => {
      if (!key.includes('-')) {
        result[key] = argv[key];
      }
      return result;
    },
    {$0: argv.$0, _: argv._},
  );
```

### Step 2: Reading Configuration File

jest supports 2 methods to look for a configuration file

1. The project `rootDir`
2. Custom location using the `--config` CLI option

When option 2 is pretty straightforward -- resolve the path and read its content, option 1 is trickier, and much more common.

When working with option 1, jest is looking for a configuration file - `jest.config.{js,ts,mjs,cjs}` (one of) OR on the `package.json` under the "jest" key.

```js
// https://github.com/facebook/jest/blob/main/packages/jest-config/src/resolveConfigPath.ts#L67
const resolveConfigPathByTraversing = (
  pathToResolve: string,
  initialPath: string,
  cwd: string,
  skipMultipleConfigError: boolean,
): string => {
  const configFiles = JEST_CONFIG_EXT_ORDER.map(ext =>
    path.resolve(pathToResolve, getConfigFilename(ext)),
  ).filter(isFile);

  const packageJson = findPackageJson(pathToResolve);
  if (packageJson && hasPackageJsonJestKey(packageJson)) {
    configFiles.push(packageJson);
  }
  // ...

// jest/packages/jest-config/src/constants
// https://github.com/facebook/jest/blob/main/packages/jest-config/src/constants.ts
export const DEFAULT_JS_PATTERN = '\\.[jt]sx?$';
export const PACKAGE_JSON = 'package.json';
export const JEST_CONFIG_BASE_NAME = 'jest.config';
export const JEST_CONFIG_EXT_CJS = '.cjs';
export const JEST_CONFIG_EXT_MJS = '.mjs';
export const JEST_CONFIG_EXT_JS = '.js';
export const JEST_CONFIG_EXT_TS = '.ts';
export const JEST_CONFIG_EXT_JSON = '.json';
export const JEST_CONFIG_EXT_ORDER = Object.freeze([
  JEST_CONFIG_EXT_JS,
  JEST_CONFIG_EXT_TS,
  JEST_CONFIG_EXT_MJS,
  JEST_CONFIG_EXT_CJS,
  JEST_CONFIG_EXT_JSON,
]);
```

:::note
See [Jest Configuration Options](https://jestjs.io/docs/configuration)
:::

## Step 3: Normalizing Configurations Data For Tests Run-time

Jest enters the normalize step when it already has all configuration types parsed, and it needs to merge everything together and using default values to fill blank mandatory options.

The `normalized` function is long, but straightforward, so I shared with you its signature and a reference if you're curious.

```js
// https://github.com/facebook/jest/blob/main/packages/jest-config/src/normalize.ts#L485
export default async function normalize(
  initialOptions: Config.InitialOptions,
  argv: Config.Argv,
  configPath?: string | null,
  projectIndex = Infinity
): Promise<{
  hasDeprecationWarnings: boolean,
  options: AllOptions,
}> {
  // ...
}
```

:::info
See Jest's mandatory options [defaults](https://github.com/facebook/jest/blob/main/packages/jest-config/src/Defaults.ts), when custom configuration doesn't define values.
:::

After receiving the `AllOptions` from the normalize function, there is a small step of classifying the options and decide for each option whether it is belong to the `ProjectConfig` or the `GlobalConfig`.

:::info
This options classification call [groupOptions](https://github.com/facebook/jest/blob/main/packages/jest-config/src/index.ts#L110).
:::

## Step 4: `jest-config` Final Run-time Options Output

`jest-config` outputs 2 runtime objects that the whole jest system uses:

1. ProjectConfig
2. GlobalConfig

Their name clarifies both purposes, but let's jump into their details real-quick.

### ProjectConfig

Project's specific custom options.

In most projects, there is only a single project, but it is a good opportunity to tell you that Jest supports running multiple projects in a single test run! That's why Jest separate between global configs and project-specific ones.

Because Jest supports multiple projects, It's implementation designed to operate with multiple `ProjectConfig` objects, and it assumes that potentially there are `1...N` `ProjectConfig` objects.

:::note
Running multiple projects in a single test run is an advanced option.
And it can be done using the [--projects CLI option](https://jestjs.io/docs/cli#--projects-path1--pathn) / [projects configuration option](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig)

:::

:::info
If you're curious what the `ProjectConfig` includes, [Here is a reference for it](https://github.com/facebook/jest/blob/main/packages/jest-types/src/Config.ts#L421).
:::

### GlobalConfig

There is a single `GlobalConfig` for every test run, no matter how many `ProjectConfig`s exists.
The `GlobalConfig` includes the global options (like how many workers you allow the Jest process to spawn and run in parallel).

:::info
If you're curious what the `GlobalConfig` includes, [Here is a reference for it](https://github.com/facebook/jest/blob/main/packages/jest-types/src/Config.ts#357)
:::

## The Options Hierarchy - The Strongest, Overwrites!

> (1) inline codeblock configuration > (2) CLI arguments > (3) Configuration File Options > (4) Jest Default Options

Let's see how it works in practice.

when running Jest with the following command:

```bash
jest --maxWorkers=11
```

And the configuration file defined as the following:

```js
// jest.config.js
module.exports = {
  maxWorkers: 4,
  automock: true,
};
```

Here is what the `normalized` function will return:
The final result of the `maxWorkers` option is 11, because:

1. inline codeblock variable = undefined
2. The CLI argument `--maxWorkers` is `11`
3. The configuration file option `maxWorkers` is `4`
4. Jest's default is `maxWorkers=50%`

The final `maxWorker` value is `11`.

:::note

The `maxWorkers` option is located at the `GlobalConfig`, because it is not specific for a particular project, but for the entire test run.
So `GlobalConfig.maxWorkers` will be 11.

:::

## See also

### JS ecosystem > Testing Frameworks > Jest 🤡

- [Architecture 🏛 > Appendix Ⅴ. Watch Mode ⏱](./appendix-5-watch-mode.md)
