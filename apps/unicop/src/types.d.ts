/**
 * duplicated from '@docusaurus/plugin-content-blog/src/plugin-content-blog'
 */
 export type Author = {
    /**
     * If `name` doesn't exist, an `imageURL` is expected.
     */
    name: string;
    /**
     * The image path could be collocated, in which case
     * `metadata.assets.authorsImageUrls` should be used instead. If `imageURL`
     * doesn't exist, a `name` is expected.
     */
    imageURL: string;
    /**
     * Used to generate the author's link.
     */
    url: string;
    /**
     * Used as a subtitle for the author, e.g. "maintainer of Docusaurus"
     */
    role?: string;
    organization?: string;
    organizationURL?: string;
    
    /**
     * Mainly used for RSS feeds; if `url` doesn't exist, `email` can be used
     * to generate a fallback `mailto:` URL.
     */
    email?: string;

    /** socials */
    social?: {
        // social
        linkedIn?: string;
        twitter?: string;
        github?: string;
    },

    id: string;
    /**
     * Unknown keys are allowed, so that we can pass custom fields to authors,
     * e.g., `twitter`.
     */
    [key: string]: unknown;
  };