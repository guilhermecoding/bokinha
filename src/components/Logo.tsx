import { IconBalloonFilled } from '@tabler/icons-react';

export default function Logo() {
    return (
        <div className='flex flex-row items-center gap-1'>
            <IconBalloonFilled size={48} className='text-purple-600' />
            <h1 className='text-4xl font-bold text-purple-600'>BOKINHA</h1>
        </div>
    );
}