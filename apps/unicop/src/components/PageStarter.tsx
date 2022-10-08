import React, {ReactNode} from 'react';
import styles from './HomepageFeatures.module.css';
import clsx from 'clsx';
import Author from '@theme/BlogPostItem/Header/Author';
// import {useBlogPost} from '@docusaurus/theme-common/internal';
// import {getAuthorsMap} from '@docusaurus/plugin-content-blog/src/authors'
// import {getAuthorsMap} from '@theme/'


interface PageStarterProps {
    tree?: { text: string, link?: string }[];
    delimiter: string;
}


export default function PageStarter({ tree, delimiter = '>' }: PageStarterProps): JSX.Element {
  return (
    <>
    <Author author={{
        email: 'its.op.the.unicorn@gmail.com',
        title: 'Software Developer @ Snappy',
        name: 'Ofri Peretz',
        url: 'https://unicop.art',
        imageURL: 'https://github.com/unicop.png'
    }}
    className={clsx("hero\_\_subtitle", "author-text")} />

    {/* <h3>
        {tree.map((t, i) => 
        <>
            {t.link ? <a key={t.link} href={t.link}>{t.text}</a> : t.text}
            {i !== (tree.length - 1) && ` ${delimiter} ` }
        </>)}
    </h3> */}
    <hr/>
    </>
    
  );
}