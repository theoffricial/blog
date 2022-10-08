# Unit Tests - Theory - Pros 👍

## The Nature of Applications to Get Bigger

The nature of an application is to get bigger, and become more complicated as we keep developing it.

At the beginning of an application, the code is thin and clear, breaking changes are easy to do, and new features can be done quickly, And the dilemma of whether to sacrifice "progress" over writing tests is under consideration, although often we do not resist the temptation and choose to focus on the "progress", because of the convenience for the wrong reasons.

In addition of the nature of the application to get bigger, often the number of people who works on it get bigger as well, when they join, gradually it becomes unrealistic for a single person to remember in detail the whole code base, and pursing it does more harm than good.
So automated tests become even more necessary.

## Confidence

As an application gets bigger, more complicated, and time passes, we don't remember the detail even of our own developments.

This situation leads to confidence loss in ourselves, and others for doing changes in the code.

Unit tests enables to confidently change code, because unit tests guarantee that if all cases passed like before the changes, the code works, as a binary result - pass or failed,
also known as 🟢 state or 🔴 state.

## Documentation by Tests

Good tests for a "unit" should describe its behavior for the different cases.
So spectating a "unit" tests should clarify how an output should be received for a certain input, and why it behaves that way.
In other words, good tests should let you understand what the code does.

## Faster Feedback Loop

The best thing we can do as creators of new digital products who aim to give real solutions to real problems is to gain meaningful feedback in any way possible. All most popular theories and methodologies, such as agile or roles like product manager, set feedback a centric value to build a product people of any kind can and will use. Well implemented tests gain us a very fast feedback loop, and very early in the development cycle, it saves us and our users from expensive issues later.

## Tests Build Culture

This one is my opinion, but I think it make sense, because tests give confidence for organizations, standard and fast feedback, have tests put an organization in a position that educate everyone that is part of it to be more conscious to good practices and their consequences, and eventually assist you to build healthier and more professional culture.

## Avoid Write Code That Tends to be Deprecated

Over time production code that is uncovered by automated test code, is tends to become “legacy code”, And “legacy code” is hard to maintain and delays scalability.

## Credits 🎖️

- Yuto - **[How to determine test values for unit testing](https://www.technicalfeeder.com/2022/04/how-to-determine-test-values-for-unit/)** - Good article explain also the pros of unit tests.

- Martin Fowler, Kent Beck, David Heinemeier - **[Is TDD Dead?](https://martinfowler.com/articles/is-tdd-dead/)** - 1: TDD and Confidence - A series of conversations on the topic of Test-Driven Development (TDD) and its impact upon software design.
