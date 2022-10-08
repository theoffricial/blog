# Sharing Thoughts 🦉

When I decided to to have a technology blog, I didn't plan to write about the jest architecture at all.
My first intention was to write from my own experience about fundamentals I found confusing for my colleagues and I assume the confusion is common among many developers, and about advanced topics and optimizations that improving developer experience or improving application performance.

During 2022 Q1-Q3, I took as a venture to push the domain of testing across the R&D at Snappy.
And because I picked jest as the testing framework, I did a research how jest works and its capabilities.
I found that deep understanding of tests both theory and implement it in practice, learn you a lot about software, and I would recommend to every developer who wants to professionally grow to learn it, Also I hope that my content can really answer many of the fundamental questions to gain this understanding.

In any case, I found jest implementation fascinating maybe because of some constraints the JavaScript language has, that made testing framework like jest to find solutions and operate upon these constraints, or maybe because something magical happened at Facebook during the period of 2010-2015 a mix of a market-fit, pure skills and great minds and jest is just a product of all that, seriously they've changed the whole JS eco-system with technologies such as create-react-app, react, jest, etc. and I just really liked the complexity and the solutions jest has to handle to actually running our tests efficiency.

So I saw the jest [architecture video](https://jestjs.io/docs/architecture) made by [cpojer](https://github.com/cpojer).

Last but not least, I really liked a sentence cpojer said, and I quote

> Jest’s packages make up an entire ecosystem of packages useful for building any kind of JavaScript tooling.
> “The whole is greater than the sum of its parts” doesn’t apply to Jest!

It is true, large parts of the jest architecture built generically in a way that specific tasks like parallelize work in multiple threads,
built with a dedicated package that other tools can use it or just inspired by it.

Personally, I will surely take some of the jest packages into consideration for any tool or architecture I would try build, and I'm being very logic here - jest done by the best, widely in use and many problems already solved and well designed and work by many.

I thought my thoughts can be helpful, so you, eys you the reader can better understand that understanding jest architecture can really help you to have wider toolbox that you can leverage to your own needs.

If you got this far, thanks I appreciate it.
And feel free to contact me for thoughts or questions via LinkedIn.
