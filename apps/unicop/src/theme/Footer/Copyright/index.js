import React from 'react';
import Copyright from '@theme-original/Footer/Copyright';
import Author from '../../../components/Author'
import { AUTHORS } from '@site/src/constants';
import styles from './Copyright.module.css';
const unicop = AUTHORS.find(a => a.id === 'unicop')
export default function CopyrightWrapper(props) {
  

  return (
    <div className={styles.container}>
      <Author 
        author={unicop} 
        note={`
      I created this blog, and I'm consistently improving it for 
      sharing ideas with others, To provide a platform for learning strong fundamentals up-to advanced topics, but above all, for fun 🦄.`} 
      />
      <Copyright {...props} />
    </div>

  );
}
