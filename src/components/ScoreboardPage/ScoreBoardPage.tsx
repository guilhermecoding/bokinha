import Page from '@/components/Page';
import Section from '@/components/Section';
import Scoreboard from './_components/Scoreboard';
import prisma from '@/lib/prisma';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BOKINHA - Placar',
  description: 'Placar detalhado do contest.',
};

export default async function ScoreboardPage({
  slugContest
}: {
  slugContest: string
}) {

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

    if (!contest) {
      notFound();
    }
  } catch (err) {
    throw new Error(`Ocorreu um erro ao buscar o Contest: ${err}`);
  }
  // const startFormatted = contest.startTime
  //   ? new Date(contest.startTime).toLocaleString('pt-BR')
  //   : '—';
  // const endFormatted = contest.endTime
  //   ? new Date(contest.endTime).toLocaleString('pt-BR')
  //   : '—';

    return (
        <Page>
            <Section className='flex justify-center'>
                <h1 className='font-bold text-4xl text-gray-800'>{contest.name}</h1>
            </Section>

            <Section className='mt-4'>
              {/* <div>Início: {startFormatted}</div>
              <div>Fim: {endFormatted}</div> */}
              <Scoreboard contestId={contest.id} />
            </Section>
        </Page>
    );
}