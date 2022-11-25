// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'unic(o|p)art',
  // tagline: 'unic(o|p)art',
  url: 'https://unicop.art',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/unicop.art.svg',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.
  plugins: ['docusaurus-plugin-sass'],
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
          // editUrl: 'https://github.com/unicop-art/blog/edit/main/apps/unicop/',
          breadcrumbs: true,
          showLastUpdateAuthor: true
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
          customCss: [require.resolve('./src/css/custom.css')],
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
        title: 'unic(o|p)art',
        logo: {
          alt: 'be unico be a part',
          src: 'img/unicop.art.svg'
        },
        items: [
          {
            type: 'doc',
            docId: 'js-es/intro',
            position: 'left',
            label: 'The JS Eco-System',
          },
          {
            type: 'doc',
            docId: 'testing/intro',
            position: 'left',
            label: 'Testing',
          },
          // {
          //   type: 'doc',
          //   docId: 'js-es/testing-frameworks/jest/intro',
          //   position: 'left',
          //   label: 'Jest 🤡',
          // },
          {
            type: 'doc',
            docId: 'js-es/testing-frameworks/jest/architecture/intro',
            position: 'left',
            label: 'Jest Architecture 🏛',
          },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/unicop',
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
                href: 'https://github.com/unicop',
              },
            ],
          },
        ],
        copyright: `Copyright ${new Date().getFullYear()} © unicop.` // <a href="/">All Rights Reserved</a>. <a href="/">Privacy Policy</a>.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
