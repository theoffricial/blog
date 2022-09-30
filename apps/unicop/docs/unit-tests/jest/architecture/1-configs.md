# Unit Tests - Jest - Architecture - 1. Configs

When running the jest CLI command:

```bash
jest <my-test-pattern> [argv]

```

The first thing jest does is to figure out the answer for "How exactly should I run?", To answer that jest collects all custom configurations defined for the specific run.

Because managing configurations is a specific task, the jest team separated this task into a package call `jest-config`.

jest allows to custom a test run in 2 ways

1. the CLI `argv`
2. dedicated configuration file e.g. `jest.config.js` _OR_ using the `"jest"` key on the `package.json`.

:::note
jest supports the argv [--config=\<path\> [-c]](https://jestjs.io/docs/cli#--configpath) option
that enables jest to look for a dedicated configuration file from a custom location instead of look for it in the `rootDir`.
:::

`jest-config` depends on these 2 methods, and based on them it builds the configuration objects for the entire test run.

## Collecting The Configs

### CLI options

jest [extract](https://github.com/facebook/jest/blob/e21c5aba950f6019bbfde2f8233ac96d1fcaef42/packages/jest-cli/src/cli/index.ts#L51) all CLI argument into an object using the [yargs](https://github.com/yargs/yargs) package.

:::note
See all [Jest CLI Options](https://jestjs.io/docs/cli)
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

### Configuration File

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
See all [Jest Configuration Options](https://jestjs.io/docs/configuration)
:::

## Normalize Run Options

At this point jest already extract the CLI argv, and the raw-options from the configuration file.

jest still has to make order from all options out there, this is why the `jest-config` has a special function call `normalize`, and it is done what it promised, it normalizes all the options received from the different configs but also has a default value for every option that jest need.

The [normalize](https://github.com/facebook/jest/blob/main/packages/jest-config/src/normalize.ts#L485) function is huge, but the signature clarifies it pretty well.

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
See jest under-the-hood [defaults](https://github.com/facebook/jest/blob/main/packages/jest-config/src/Defaults.ts)
:::

After receiving the `AllOptions` from the normalize function, there is a small step of classifying the options and decide for each option whether it is belong to the `ProjectConfig` or the `GlobalConfig`.

:::info
This options classification call [groupOptions](https://github.com/facebook/jest/blob/main/packages/jest-config/src/index.ts#L110).
:::

## Final Output

`jest-config` outputs 2 runtime objects that the whole jest system uses:

1. ProjectConfig
2. GlobalConfig

### ProjectConfig

This config includes all customize options of a specific project, because jest knows how to run multiple projects in a single test run, with the [--projects CLI option](https://jestjs.io/docs/cli#--projects-path1--pathn) / [projects configuration option](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig).

It also means that jest can operate with multiple `ProjectConfig`, so possibly there are `1...N` `ProjectConfig` be generated.

:::info
See [ProjectConfig interface](https://github.com/facebook/jest/blob/main/packages/jest-types/src/Config.ts#L421)
:::

### GlobalConfig

This config created only once, and includes all options that are relevant for everything that is more generic than a specific project.

:::info
See [GlobalConfig interface](https://github.com/facebook/jest/blob/main/packages/jest-types/src/Config.ts#357)
:::

## Options Hierarchy

> CLI arguments (1) > Configuration File Options (2) > Jest Default Options (3)

### Hierarchy Example

when running `jest` with the following command:

```bash
jest --maxWorkers=11
```

While your configuration defined like this:

```js
// jest.config.js
module.exports = {
  maxWorkers: 4,
  automock: true,
};
```

The final result of the `maxWorkers` option is 11, because:

- CLI argument `--maxWorkers` is 11
- Configuration file option `maxWorkers` is 4
- Jest default is `maxWorkers=50%`

The `maxWorkers` option is part of the `GlobalConfig` because it is not related to a specific project but to the actual test run constraints.
So `GlobalConfig.maxWorkers` will be 11.

## Credits 🎖️

- [Christoph Nakazawa](https://twitter.com/cpojer) - For the great (but old) [Jest Architecture](https://youtu.be/3YDiloj8_d0) video, without it I won't be able to build this series.
- The past and present members/maintainers of jest 🙏
