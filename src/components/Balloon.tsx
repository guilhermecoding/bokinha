import { IconBalloon, IconBalloonFilled } from '@tabler/icons-react';
import React from 'react';
import { twMerge } from 'tailwind-merge';


interface BalloonProps {
    color: string | null | undefined;
    className?: React.HTMLAttributes<SVGElement>['className'];
}

/**
 * Icone de balão iterativo
 */
export default function Balloon({
    color,
    className
}: BalloonProps) {
  return (
    (color?.toLocaleLowerCase() === '#ffffff') ? (
        <IconBalloon 
            className={twMerge('w-8 h-8', className)} 
            style={{ color: 'black' }}  
        />
    ) : (
        <IconBalloonFilled 
            className={twMerge('w-8 h-8', className)} 
            style={{ color: color ?? undefined }}  
        />
    )
    );
}