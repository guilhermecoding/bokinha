import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'BOKINHA - Brazil Online Contest Administrator Kids',
  description: 'BOKINHA é uma plataforma para gerenciar competições de programação para crianças e adolescentes.',
};

export default async function ContestLayout({
    children
}: {
    children: React.ReactNode;
}) {

    return (
        <>
            <Header />
            {children}
        </>
    );
}

