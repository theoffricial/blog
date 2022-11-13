import React from 'react';

export interface Props extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
    href: string;

}

export default function MaybeLink({
    href,
    children,
    ...props
}: React.PropsWithChildren<Props>) {
    return href ?  
        <a href={href} {...props}>{children}</a> : 
        (<>{children}</>)
}