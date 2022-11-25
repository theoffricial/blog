
import clsx from "clsx";
import React from "react";
import type {Author as IAuthor} from 'src/types'
import MaybeLink from "../MaybeLink";
import Email from "../Social/Email";
import GitHub from "../Social/GitHub";
import LinkedIn from "../Social/LinkedIn/LinkedIn";
import Tweeter from "../Social/Twitter/Twitter";
import styles from './Author.module.css';

export interface Props {
  readonly author: IAuthor;
  readonly note?: string;
  readonly className?: string;
}

// "avatar",
          // 'margin-bottom--sm', 
          // "hero\_\_subtitle", 
          // "author-margin"

export default function Author({
    author,
    note,
    className,
  }: Props): JSX.Element {
    const {name, role: role, organization, organizationURL, url, imageURL, email, social} = author;
    const link = url || (email && `mailto:${email}`) || undefined;
    
    return (
      <div className={styles.avatar__container}>


        <div className={styles.avatar__details}>
          
          {imageURL && (
            <MaybeLink href={link} className={styles["avatar__photo-link"]} target="_blank" rel="noopener noreferrer">
              <img className="avatar__photo" src={imageURL} alt={name} />
            </MaybeLink>
          )}
    
          {name && (
            <div
              className={styles.avatar__intro}
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person">

              <div className={clsx(styles.avatar__name, "avatar__name--display", "avatar__name")}>
                <MaybeLink href={link} itemProp="url" target="_blank" rel="noopener noreferrer">
                  <span itemProp="name">{name}</span>
                </MaybeLink>
                {(email || social) && 
                  <div className={styles.avatar__social}>
                    {email && (
                      <Email email={email} className={styles['avatar__social--link']} />
                    )}
                    {social?.linkedIn && (
                      <LinkedIn url={social?.linkedIn} className={styles['avatar__social--link']} />
                    )}
                    {social?.github && (
                      <GitHub url={social?.github} className={styles['avatar__social--link']} />
                    )}
                    {social?.twitter && (
                      <Tweeter url={social?.twitter} className={styles['avatar__social--link']} />
                    )}
                  </div>
                }
              </div>
              {role && (
                <div className={styles.avatar__job}>
                <small className={clsx(styles.avatar__role, "avatar__subtitle")} itemProp="description">
                  {role}
                </small>
                  {organization && (
                    <small className={clsx(styles.avatar__org, "avatar__subtitle")} itemProp="description">
                    &nbsp;@&nbsp;<b><MaybeLink href={organizationURL} itemProp="organizationURL" target="_blank" rel="noopener noreferrer">
                      {organization}
                    </MaybeLink></b>
                  </small>
                  )}
                  </div>
              )}

            </div>
          )}

        </div>
        {note && (<div className={clsx(styles.avatar__note, "avatar__intro")} style={{ maxWidth: '500px'}}>
                  <p>{note}</p>
        </div>)}

      </div>
    );
  }