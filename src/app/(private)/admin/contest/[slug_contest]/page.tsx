import Page from '@/components/Page';
import Section from '@/components/Section';
import BoxContestInfo from './_components/BoxContestInfo';
import BoxStudentsInfo from './_components/BoxStudentsInfo';
import prisma from '@/lib/prisma';
import {notFound} from 'next/navigation';
import BoxQuestions from './_components/BoxQuestions';
import {IconArrowBadgeLeftFilled} from '@tabler/icons-react';
import Link from 'next/link';
import log from '@/lib/log';

const APP_NAME = 'ContestPage';

export default async function ContestPage({
                                              params,
                                          }: {
    params: Promise<{ slug_contest: string }>
}) {
    const {slug_contest: slugContest} = await params;

    // Busca minima para checar existência
    const contest = await prisma.contest.findUnique({
        where: {slug: slugContest},
        select: {id: true, name: true, slug: true},
    });

    if (!contest) {
        log(APP_NAME, 'WARNING', 'Competição não encontrada', {slug: slugContest});
        return notFound();
    }

    return (
        <Page className='gap-5'>
            <Section>
                <Link href='/admin' className='flex w-min items-center cursor-pointer hover:font-bold'>
                    <IconArrowBadgeLeftFilled/> Competições
                </Link>
            </Section>
            {/* Blocos superiores */}
            <Section className='flex flex-col lg:flex-row justify-between gap-5'>
                <BoxContestInfo contestId={contest.id}/>
                <BoxStudentsInfo contestId={contest.id}/>
            </Section>

            {/* Blocos inferiores */}
            <Section>
                <BoxQuestions contestId={contest.id}/>
            </Section>
        </Page>
    );
}