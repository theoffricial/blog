// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'unicop',
  tagline: 'be unico, be part',
  url: 'https://unicop.art',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/unicop.art.svg',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // docs: false,
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/blog',
          // sidebarCollapsible: true,
          // sidebarCollapsed: true,
          // // Please change this to your repo.
          editUrl: 'https://github.com/unicop-art/blog/edit/main/apps/unicop/',
          breadcrumbs: true,
        },
        blog: false,
        // blog: {
        //   blogTitle: 'unicop',
        //   routeBasePath: '/blog',
        //   showReadingTime: true,
        //   blogSidebarTitle: 'All posts',
        //   blogSidebarCount: 'ALL',
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/uniorg/personal-blogs/edit/main/apps/unicop/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        googleAnalytics: {
          trackingID: 'G-S5TKJR0D2J'
        },
        gtag:{
          trackingID: 'G-S5TKJR0D2J'
        }
      }),
    ],
  ],
  themes: [
    '@saucelabs/theme-github-codeblock'
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'unicop',
        logo: {
          alt: 'be unico be a part',
          src: 'img/unicop.art.svg'
        },
        items: [
          {
            type: 'doc',
            docId: 'typescript/index',
            position: 'left',
            label: 'TypeScript',
          },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/unicop-art/blog',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus',
          //     },
          //     {
          //       label: 'Twitter',
          //       href: 'https://twitter.com/docusaurus',
          //     },
          //   ],
          // },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/unicop-art/blog',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} unicop. Built with Docusaurus 🦖.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
