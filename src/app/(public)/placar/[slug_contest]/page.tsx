import Page from '@/components/Page';
import Section from '@/components/Section';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Scoreboard from './_components/Scoreboard';

export default async function PlacarPage({
    params
}: {
    params: Promise<{slug_contest: string }>
}) {
    const { slug_contest } = await params;

    const contest = await prisma.contest.findUnique({ where: { slug: slug_contest } });
    if (!contest) {
        notFound();
    }

    return (
        <Page>
            <Section className='flex justify-center'>
                <h1 className='font-bold text-4xl text-gray-800'>{contest.name}</h1>
            </Section>
            <Section className='mt-4'>
                <Scoreboard contestId={contest.id} />
            </Section>
        </Page>
    );
}