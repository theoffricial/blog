---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_updated:
  date: 11/25/2022
  author: Ofri Peretz
---

# Environment 🏷

## What an Environment is

An environment is where your code is pushed live to the intended users.
Think of it as a final phase of production.
This is the environment where the end user can see, experience, and interact with your code.

## Production Code Depends On Its Target Environment

Usually, when we write code our goal is to run it with a specific executor/technology, e.g. Nodejs, browsers, etc. These end-executors come with a set of built-in implementations of interfaces that our code depends on, For instance, code that has written to run over browsers depends on DOM interfaces, like the window object.
Without these implementations are code won't run, and of course these implementations comes with the environment.

That's why production code depends on its target environment in order to run.

## Test Code Depends On Production Code

When we write real tests (not for practice), we write them to ensure production code is working, in practice we import the production code into our test file to test it, and that is the definition of dependency.

It also means that test code depends on the production code's target environment.

## What a Test Environment is

This definition builds on the following terms:

1. [What an environment is](#what-a-test-environment-is)
1. That [production code depends on its target environment](#production-code-depends-on-its-target-environment)
1. That [test code depends on production code](#test-code-depends-on-production-code)

So make sure they make sense to you.

When running tests using a testing framework, e.g. jest, the testing framework's default environment might be incompatible to the environment the production code expects.

It means that the test runner should be able to customize the runtime environment of the test code to successfully run.

For example, when testing react code with jest, jest's default environment is Nodejs, so jest has to customize the runtime environment when running a test file that has react code in it.

## See also

### JS ecosystem > Testing Frameworks > Jest 🤡

- [Architecture > Part 5. The Runtime Environment 💽](../js-es/testing-frameworks/jest/architecture/part-5-the-runtime-environment.md)

### Testing > Foundations 🏗️

- [Test Environment](../testing/foundations/test-environment.md)
