---
pagination_prev: null
pagination_next: js-es/typescript/index
last_update:
  date: 07/10/2022
  author: Ofri Peretz
---

# What you can find here 🧐

As the JS eco-system become mature, projects gets bigger, and the monorepo era is already here.

The eco system is messy but offers many great solutions for almost anything.

In this blog I write from my own experience about the JS eco-system fundamental concepts that developers often find confusing but truly necessary to deeply understand how the tools that actually push the eco-system forward work.
While the fundamentals are necessary, I also write on more advanced topics on how to utilize, optimize, and solve problems while working with such tools, like transpilers (TypeScript, Babel, etc.), module bundlers (webpack, etc.), testing frameworks (jest, etc.), and so on.

<!-- <div onClick={() => console.log(typescriptSidebar)} >fsdsdksjfpsdajfpjdskpfjsd</div> -->

## Topics 🦉

import DocCardList from '@theme/DocCardList';
import {typescriptSidebar} from '../../sidebars.js';

<DocCardList items={[{
type: 'category',
label: 'TypeScript',
items: [
{
type: 'link',
docId: 'js-es/typescript/index',
href: '/blog/js-es/typescript',
label: 'TypeScript Introduction ✨'
},
],
collapsed: true,
collapsible: true,
}]} />

<!-- type: 'link',
docId: 'js-es/typescript/index',
href: '/blog/js-es/typescript',
label: 'Introduction ✨' -->

<!-- <DocCardList items={typescriptSidebar} /> -->

<!-- mdx -->

<!-- import { useCurrentSidebarCategory } from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items} />  -->
