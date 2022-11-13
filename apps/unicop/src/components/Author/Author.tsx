
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
  readonly shortSection?: string;
  readonly className?: string;
}

// "avatar",
          // 'margin-bottom--sm', 
          // "hero\_\_subtitle", 
          // "author-margin"

export default function Author({
    author,
    shortSection,
    className,
  }: Props): JSX.Element {
    const {name, role: role, organization, organizationURL, url, imageURL, email, social} = author;
    const link = url || (email && `mailto:${email}`) || undefined;
    
    return (
      <div className={"avatar__container"}>


        <div className="avatar__details">
          
          {imageURL && (
            <MaybeLink href={link} className="avatar__photo-link" target="_blank" rel="noopener noreferrer">
              <img className="avatar__photo" src={imageURL} alt={name} />
            </MaybeLink>
          )}
    
          {name && (
            <div
              className="avatar__intro"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person">
              <div className={clsx("avatar__name--display", "avatar__name")}>
                <MaybeLink href={link} itemProp="url" style={{ marginRight: '0.25rem'}} target="_blank" rel="noopener noreferrer">
                  <span itemProp="name">{name}</span>
                </MaybeLink>
                {(email || social) && 
                  <div className={styles.avatar__social}>
                    {email && (
                      <Email email={email} style={{ width: '1.25rem' }}/>
                    )}
                    {social?.linkedIn && (
                      <LinkedIn url={social?.linkedIn} style={{ width: '1.25rem' }} />
                    )}
                    {social?.github && (
                      <GitHub url={social?.github} style={{ width: '1.25rem' }} />
                    )}
                    {social?.twitter && (
                      <Tweeter url={social?.twitter} style={{ width: '1.25rem' }} />
                    )}
                  </div>
                }
              </div>
              {role && (
                <small className="avatar__subtitle" itemProp="description">
                  {role}
                  {organization && (
                  <small className="avatar__subtitle" itemProp="description">
                    &nbsp;@&nbsp;<MaybeLink href={organizationURL} itemProp="organizationURL">
                      {organization}
                    </MaybeLink>
                  </small>
                  )}
                </small>
              )}

            </div>
          )}

        </div>
        {shortSection && (<div className="avatar__intro" style={{ maxWidth: '500px'}}>
                  <p>{shortSection}</p>
        </div>)}

      </div>
    );
  }