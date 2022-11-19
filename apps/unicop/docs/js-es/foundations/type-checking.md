# Type-Checking 🏷

The process of verifying and enforcing the constraints of types, called type-checking.

The type-checking occurs at compile-time, also called static type-checking, or at run-time, also called dynamic type-checking.

If a language specification requires its typing rules strongly (i.e., more or less allowing only those automatic type conversions that do not lose information), one can refer to the process as strongly typed, if not, as weakly typed. The terms are not usually used in a strict sense.

## Static type-checking

Static type checking is the process of verifying the type safety of a program based on analysis of a program's text (source code).

For instance, the [TypeScript compiler](../typescript/foundations/ts-compiler.md) includes static type-checking.

## Dynamic type-checking

Dynamic type checking is the process of verifying the type safety of a program at runtime.

For instance, the [JavaScript engine](./js-engine.md) has dynamic type-checking, as a fact, the `TypeError` exists.

## Type-checking cost

type-checking consider as an expensive action, that's why static type-checking is more popular today, to reduce checks from run-time, and dynamically type checking only what can't be check statically.

## See also

### Foundations 🏗️

- [JavaScript Engine 🏷️](./js-engine.md)
- [Incremental Build 🏷️](./incremental-build.md)

### TypeScript 🏗️

- [TypeScript > Compiler](../typescript/foundations/ts-compiler.md)

<!-- Types and type-checking is the ability of a programming languages to give quick feedback of bugs about nonsense variables assignments so we can fix them quickly, and its purpose is to help us, the developers to develop quicker.
<!--
There are 2 types of languages type-checking
options:


- Dynamically typed languages
- Statically-typed languages

Before describing the types, it is important to understand that the computer science rational is that type-checking is an extremely heavy algorithm.
For every function you call, all types involved must be validated (or coerced which may be another function call), and type information must be updated afterwards.

That is why at runtime you can only afford to have a simple type system and very little optimization for reasonable execution time.

Which give the privilege for a compiler by comparison to exploit even weaker type system to optimize your inefficient algorithms away than interpreters.

Ultimately, this means languages designed for interpreters (type-checking at runtime) can't afford the level of typing a [compiler](./compiler.md) can. In addition to having less freedom to exploit type information to optimize:

- strike 1 to performance - they must carry and modify type information at runtime
- strike 2. The weaker type system also introduces many type safety bugs.

## Dynamically-typed Languages

_Dynamically typed languages examples_: JavaScript, Python.

Dynamically typed languages must perform type-checking while code is running.
Although they can sometimes be compiled, they need to cut many corners for reasonable performance. One big drawback of checking at runtime is that if a type fails to be valid, the interpreter can only throw exceptions or stop execution.

So they often try to coerce types to prevent exceptions, even when it may be undesirable. In python, it isn't uncommon to discover that a simple division by whole integers means that my user output is suddenly full of '2.0' because I didn't explicitly cast back into `int`.

That is why it is common for dynamically-typed languages to be interpreted, and not compiled. --> -->

<!-- ## Statically-typed Languages

_Example languages_: TypeScript, C#, Java

When languages is being designed for a [compiler](./compiler.md), the compiler has also the responsibility of type-checking, because that way, it allows to the runtime code to be more optimal, and it won't need to manage typing at runtime.

It make sense, that the less you need to be responsible at runtime, the faster code will execute.

That's why it is very common for statically-typed languages to be compiled. -->

<!-- https://stackoverflow.com/a/41624354/11554280 -->
