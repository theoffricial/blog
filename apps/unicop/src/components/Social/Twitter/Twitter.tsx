import React from 'react';
import MaybeLink from '../../MaybeLink';

interface Props extends React.SVGProps<SVGSVGElement> {
    url: string;
}

export default function Tweeter({ url, className, style }: Props) {
    return (

        <MaybeLink className={className} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column'}}>

            <svg 
                    style={style}
                    viewBox="0 0 32 32"
                    className={className}
                    xmlns="http://www.w3.org/2000/svg" 
                    >
                <path fill="currentColor" d="M2 4c4 4 8 8 13 7a6 6 0 0 1 7-7 6 6 0 0 1 4 2 8 8 0 0 0 5-2 8 8 0 0 1-3 4 8 8 0 0 0 4-1 8 8 0 0 1-4 4 18 18 0 0 1-18 19 18 18 0 0 1-10-3 12 12 0 0 0 8-3 8 8 0 0 1-5-4 8 8 0 0 0 3-.5A8 8 0 0 1 0 12a8 8 0 0 0 3 1 8 8 0 0 1-1-9"/>
            </svg>
        </MaybeLink>

        )
}