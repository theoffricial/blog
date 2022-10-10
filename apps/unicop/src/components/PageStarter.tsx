import React, {ReactNode} from 'react';
import styles from './HomepageFeatures.module.css';
import clsx from 'clsx';
import Author from '@theme/BlogPostItem/Header/Author';

interface PageStarterProps {
    tree?: { text: string, link?: string }[];
    delimiter: string;
    // 
    formattedLastUpdatedAt?: string;
    author?: string;
    lastUpdatedBy?: string;
}

const name = 'Ofri Peretz';
const title = 'Software Developer @ Snappy';
const email = 'its.op.the.unicorn@gmail.com';
const url = 'https://unicop.art';
const imageURL = 'https://github.com/unicop.png';
export default function PageStarter({ tree, delimiter = '>',lastUpdatedBy, formattedLastUpdatedAt }: PageStarterProps): JSX.Element {

  return (
    <>

    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Author author={{
          email,
          title,
          name,
          url,
          imageURL
      }}
      className={clsx("hero\_\_subtitle", "author-text")} />
      {/* <LastUpdated lastUpdatedBy={lastUpdatedBy || author} formattedLastUpdatedAt={formattedLastUpdatedAt}></LastUpdated> */}
      {/* <h3>
          {tree.map((t, i) => 
          <>
              {t.link ? <a key={t.link} href={t.link}>{t.text}</a> : t.text}
              {i !== (tree.length - 1) && ` ${delimiter} ` }
          </>)}
      </h3> */}
    </div>
      <hr/>
      </>
    
  );
}