import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'BOKINHA - Brazil Online Contest Administrator Kids',
  description: 'BOKINHA é uma plataforma para gerenciar competições de programação para crianças e adolescentes.',
};

// Busca informações da competição com cache para otimização
export const getContest = cache(async (slug: string) => {
  return prisma.contest.findUnique({
    where: { slug },
    select: { id: true, name: true, startTime: true, endTime: true },
  });
});


export default async function ContestLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ slug_contest: string }>;
}) {
  const { slug_contest } = await params;

    const contest = await getContest(slug_contest);

    if (!contest) {
        notFound();
    }

    return (
        <>
            <Header />
            {children}
        </>
    );
}

