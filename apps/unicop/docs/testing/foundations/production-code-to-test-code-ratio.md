---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 11/25/2022
  author: Ofri Peretz
---

# Production/Test Code Ratio 🧭 ☯

## Basic terms

### Production-code

The code that actually serves the clients, or do what the program aims to do.

---

### Test-code

The code that test or verify the production-code. test-code isn't should not be deploy or to be executed together with the actual program production execution.

---

## the Ratio

An important term you can use to explain the ratio between how many lines of test-code takes for one line of production-code.

For instance, if you take a one line function and you want to write unit tests for it, the tests will require at least 1 line of code, because the minimum scenario is to test it with a one line of code, but if you need extra setup, multiple test assertions, setting mocks or run cleanup, test-code might be longer.

It is important to understand for yourself and for other stakeholders to know that tests make your code-base bigger. And the more code you have, the more maintenance it takes.

I took a reference from the article on the "Credits" section in which a compiler program described as its ratio is 4-to-1, 4 lines of test-code for every one line of production code.
It means that if this program aims for 100%, the code base is 400% larger than the actual production-code.

:::info Illustration
let's say you have a program with 100 lines of code, to cover this program 100% with unit tests. You should accept that it will take you somewhere between 100-400 lines of test-code.

So your total code will be

100 + 100-400 = (200 + 0-300) lines of code
:::

<!-- ## Credits 🎖️

Martin Fowler, Kent Beck, David Heinemeier - **[Is TDD Dead?](https://martinfowler.com/articles/is-tdd-dead/)** - 4: Costs of Testing - A series of conversations on the topic of Test-Driven Development (TDD) and its impact upon software design. -->

## See also

### Software Foundations 🏗️

- [Production Code 🔥](../../foundations/production-code.md)

### Testing > Foundations 🏗️

- [Test Code 🧪](./test-code.md)
