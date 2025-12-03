import Logo from '@/components/Logo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BOKINHA - Placar',
  description: 'Placar detalhado do contest.',
};

export default function PlacarLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className='w-full flex justify-center px-8 py-4'>
                <Logo />
            </div>
            {children}
        </>
    );
}