# Cons 👎

## Larger codebase

The **[production/testing code ratio](./production-code-to-test-code-ratio.md)** tells us that seeking 100% code coverage means that the code we maintain is larger by probably at least 100% than the production-code, when a more realistic amount is somewhere between 200%-300% larger.

This ratio aims to be true only for real production programs with real users that multiple people are working on it, programs that have a solid structure and modularity, not your garage/side project.

It means that your actual program is still 100 lines of code but I need to maintain at least 200 lines of code.

And each line of code can cause a bug, because we human.

## Knowledge Learning Curve

When treating knowledge as an organizational resource, building a strong testing culture requires expertise in developing a strong philosophical understanding, a strong professional understanding of the technical tools, and reflection tools (Testing SaaS solution & SCM integration), and the development of organizational OKR and guidelines. As I said at the beginning, Testing is a domain, not something logistic that only requires time to do.

## Longer pipelines

During the time when the number of implemented tests grows in the system, and although testing frameworks have certain optimization mechanisms, the test execution will become an issue that requires to be managed smartly, to do so expertise is required, and expertise requires resources (=money), resources are always limited so developing expertise in the testing domain comes at the expense of another domain, for instance, delivering amazing features to our users.

## Quote 🦜

> The thing we call money is just an information system for labor allocation.
>
> _Elon musk_

## Credits 🎖️

- Martin Fowler, Kent Beck, David Heinemeier - **[Is TDD Dead?](https://martinfowler.com/articles/is-tdd-dead/)** - 1: TDD and Confidence - A series of conversations on the topic of Test-Driven Development (TDD) and its impact upon software design.
