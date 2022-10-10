import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx(styles.heroBanner)}>
    <div className="container">
      {/* <img className={clsx('margin-vert--md', "avatar__photo")} src="https://github.com/unicop.png" alt="Ofri Peretz" style={{width: '100px', height: '100px'}}/> */}
      <img
        className={clsx(styles.heroBannerLogo, "margin-vert--md")}
        src={useBaseUrl("img/unicop.art.svg")}
        width="300"
        height="300"
      />

      
      <h1 className="hero__title">{siteConfig.title}</h1>
      <p className="hero__subtitle">{siteConfig.tagline}</p>
      
      
      <h2>Topics</h2>

      <div className={'blog-topics'}>
        <div className={styles.buttons}>
          <Link
            className={clsx(styles.tsButton,"button", "button--lg")}
            to="/blog/js-es/typescript"
          >
            TypeScript       
            <img
              className={clsx(styles.heroBannerLogo, styles.tsButtonImg)}
              src={useBaseUrl("img/typescript/ts-white.svg")}
              width="20"
              height="20"
            />
          </Link>
        </div>

        <div className={styles.buttons}>
          <Link
            className={clsx(styles.unitTestsButton,"button", "button--lg")}
            to="/blog/testing/unit"
          >
            Unit Tests 🧪
          </Link>
        </div>
      </div>

      </div>
  </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title='blog'
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        
      </main>
      
    </Layout>
  );
}
