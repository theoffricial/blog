---
pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 03/09/2022
  author: Ofri Peretz
---

# Why (and What) I Write About Jest 🤡

Jest, is a testing framework that originally developed as an open-source by Facebook (Meta), and recently the maintenance delegated to OpenJS.

Personally, I'm a heavy user of Jest, at least as I'm writing these lines.
I wrote, and reviewed thousands of tests using Jest. Also, I faced some advanced issues with Jest like optimizing max parallelize workers, enforce resource limitation on Jest for background jobs, configured plenty of different configurations on both node environment and browser-like environments, and led a code coverage OKR for the entire R&D at Snappy (7 teams).

Because I has worked so many hours with Jest, I've become curious how it works, while I've faced many developers who were confuse working with Jest, So I decided I should write about it.

Here I wrote an entire series of Jest architecture, I will cover with examples how all Jest mocks functions work, how to use Jest environment, and more.

import DocCardList from '@theme/DocCardList';
import { useCurrentSidebarCategory } from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items} />

<!-- <p align="center">
    <img src="/img/jest.svg" />
</p> -->
