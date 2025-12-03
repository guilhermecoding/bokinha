'use client';

import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { IconLogout } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';

export default function Header() {
  return (
    <header className='w-full py-5 flex justify-center'>
        <div className='w-11/12 sm:w-4/5 flex items-center justify-start'>
            <Logo />

            <div className='w-full flex justify-end'>
              <Button variant='ghost' className='cursor-pointer' onClick={() => signOut({ callbackUrl: '/login'})}>
                <IconLogout className='w-8 h-8 text-red-500' />
              </Button>
            </div>
        </div>
    </header>
  );
}
