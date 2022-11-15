import React from 'react';
import DocItem from '@theme-original/DocItem';
import { AUTHORS } from '@site/src/constants';
import Author from '../../components/Author'
import clsx from 'clsx';
import styles from './index.module.css';

const ofriPeretz = 'unicop';
const note = "If you want to share your honest feedback, reach out 🙏."

export default function DocItemWrapper(props) {

  // console.log('props: ', props)
  // console.log('authors:', props.content.metadata.frontMatter.authors)
  // console.log(final)

  const authors = props.content.metadata.frontMatter.authors ?? [ofriPeretz];

  const final = AUTHORS.filter((author) => authors.includes(author.id));
  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      <div className={styles.authors}>
      {
        final.map((author) => {
          const n = author.id === ofriPeretz ? note : null;
          return  (
            <>
            <Author 
              author={author} 
              key={author.id} 
              className={clsx("")} 
              note={n}
              />
            </>
          )
        })
      }
      </div>
      {/* <p style={{ marginLeft: '1rem'}}>
        I'm looking for honest feedback. Please reach me out on <a href={final[0].url}>LinkedIn</a> or via <a href={`${honestFeedbackEmail}?subject=${final[0].name}%20${mailSubject}`}>email</a>.
      </p> */}
    </div>

      {/* <br /> */}
      { final.length > 0 && <hr style={{ marginTop: 0 }}/> }
      <DocItem {...props} />
    </>
  );
}
