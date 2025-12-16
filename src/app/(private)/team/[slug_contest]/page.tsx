import Page from '@/components/Page';
import Section from '@/components/Section';
import BoxContainer from '@/components/BoxContainer';
import TimeContest from './_components/TimeContest';
import ContainerQuestions from './_components/ContainerQuestions';
import ContainerScoreboard from './_components/ContainerScoreboard';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import GreetingUser from './_components/GreetingUser';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import getContestStatus from '@/lib/get-content-status';
import RegressiveTimer from '@/components/RegressiveTime/RegressiveTimer';

export default async function ContestPage({
    params
}:{
    params: Promise<{ slug_contest: string }>
}) {
    const { slug_contest: slugContest } =  await params;

    let contest;
    try {
        contest = await prisma.contest.findUnique({
            where: { slug: slugContest },
            select: { 
                id: true,
                name: true,
                startTime: true,
                endTime: true
             }
        });
    } catch (err) {
        throw new Error(`Erro ao buscar contest: ${err}`);
    }

    if (!contest) {
        notFound();
    }

    const session: Session | null = await getServerSession(authOptions);

    // Pega apenas o primeiro nome para a saudação
    const fullName = session?.user?.name ?? '';
    const firstName = fullName.split(/\s+/)[0] ?? '';

    const status = getContestStatus(
        contest.startTime,
        contest.endTime
    );

    if (status === 'BEFORE') {
        return (
            <RegressiveTimer
                startDate={contest.startTime}
            />
        );
    }

    if (status === 'FINISHED') {
        return (
            <Page>
                <Section className='h-[80vh] flex justify-center items-center'>
                    <h1 className='font-bold text-muted-foreground text-3xl'>
                        Competição Finalizada
                    </h1>
                </Section>
            </Page>
        );
    }

    return (
        <Page className='gap-3'>
            <Section>
                <BoxContainer className='flex max-[1170px]:flex-col justify-between items-center max-[1170px]:gap-4 max-[1170px]:text-center rounded-3xl'>
                    <GreetingUser firstName={firstName} contestName={contest?.name} />
                    <TimeContest startTime={contest?.startTime} endTime={contest?.endTime} />
                </BoxContainer>
            </Section>
            <Section className='flex gap-3 flex-row max-[1170px]:flex-col'>
                <div className='min-w-9/12'>
                    <ContainerQuestions contestId={contest?.id} />
                </div>
                <div className='w-full'>
                    <ContainerScoreboard contestId={contest?.id} slug={slugContest} />   
                </div>
            </Section>
        </Page>
    );
}