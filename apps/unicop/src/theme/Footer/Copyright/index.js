import React from 'react';
import Copyright from '@theme-original/Footer/Copyright';
import Author from '../../../components/Author'
import { AUTHORS } from '@site/src/constants';

const unicop = AUTHORS.find(a => a.id === 'unicop')
export default function CopyrightWrapper(props) {
  return (

    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'left'}}>
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
