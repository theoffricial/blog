import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import logoAnimationStyles from './logo-animation.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
// import ThemedImage from '@theme/ThemedImage';

import Typewriter from 'typewriter-effect';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  
  return (
    <header className={clsx(styles.homePageHeader)}>
      <div className={styles.firstContainer}>
        <h5 className={styles.welcomeTo}>Welcome to</h5>
        <h1 className={styles.blogTitleName}>unic(o|p)art</h1>
        <div className={styles.taglineContainer}>
            <p className={styles.taglineFirstPart}>A blog</p>
            {/* <br />
            <br /> */}
            <p className={styles.taglineSecondPart}>that helps you master</p>
            {/* <br />
            <br /> */}
          <div className={styles.taglineThirdPart}>
            <Typewriter
              options={{
                strings: [
                  'JavaScript ecosystem.', 
                  'Unit Testing.', 
                  'TypeScript.', 
                  'Jest 🃏.'
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </div>
        </div>
          <div className={styles.logoContainer}>
            <img
              className={clsx(logoAnimationStyles.logoAnimation, styles.logo)}
              src={useBaseUrl("img/unicop.art.svg")}
              />
          </div>
      </div>
    </header>
  );
}
{/* <div style={{ display: 'flex' }}>
  <a href="https://www.linkedin.com/in/unicop">
  </a>
</div> */}
      
            {/* <svg aria-labelledby="svg-inline--fa-title-vgOLjG1P0b3x" data-prefix="fab" data-icon="linkedin" color='white' width={30}
              className={clsx("svg-inline--fa", "fa-linkedin", "fa-2x")} role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <title id="svg-inline--fa-title-vgOLjG1P0b3x">Linkedin</title>
              <path fill="currentColor"
                  d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z">
              </path>
              </svg> */}
              {/* <ThemedImage width={30} style={{ fill: 'white'}} sources={{
                light: useBaseUrl('/img/social/linkedin.svg'),
                dark: useBaseUrl('/img/social/linkedin.svg')
              }} /> */}
              {/* <img color="white" width="30" src={useBaseUrl("img/social/linkedin.svg")}></img> */}
      {/* <h1 className="hero__title">{siteConfig.title}</h1>
      <p className="hero__subtitle">{siteConfig.tagline}</p>
      
      
      <h2>Topics</h2>

      <div className={'blog-topics'}>
        <div className={styles.buttons}>
          <Link
            className={clsx(styles.tsButton,"button", "button--lg")}
            to="/blog/js-es/typescript"
          >
            The JS Eco-System       
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
      </div> */}

      {/* </div> */}


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
