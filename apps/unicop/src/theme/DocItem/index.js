import React from 'react';
import DocItem from '@theme-original/DocItem';
import { AUTHORS } from '@site/src/constants';
import Author from '../../components/Author'
import clsx from 'clsx';

const ofriPeretz = 'unicop';
// const honestFeedbackEmail = 'mailto:its.op.the.unicorn@gmail.com';
// const mailSubject = 'here%20is%20my%20honest%20feedback%20(unicop.art)!';
// window.ga = () => {};
const note = `I seek what's true, and I can't do it alone! Please contact to share honest feedback.`

export default function DocItemWrapper(props) {

  // console.log('props: ', props)
  // console.log('authors:', props.content.metadata.frontMatter.authors)
  // console.log(final)

  const authors = props.content.metadata.frontMatter.authors ?? [ofriPeretz];

  const final = AUTHORS.filter((author) => authors.includes(author.id));
  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', flexDirection: 'row' }}>
      {
        final.map((author) => {
          
          return  (
            <>
            <Author 
              author={author} 
              key={author.email} 
              className={clsx("")} 
              note={note}
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
      <hr style={{ marginTop: 0 }}/>
      <DocItem {...props} />
    </>
  );
}
