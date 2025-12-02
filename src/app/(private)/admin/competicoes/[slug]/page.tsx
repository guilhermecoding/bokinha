import Page from '@/components/Page';
import Section from '@/components/Section';
import BoxContestInfo from './_components/BoxContestInfo';
import BoxStudentsInfo from './_components/BoxStudentsInfo';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BoxQuestions from './_components/BoxQuestions';

export default async function ContestPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  // busca minimal para checar existência
  const contest = await prisma.contest.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!contest) {
    return notFound();
  }

  return (
    <Page className='gap-5'>
      {/* Blocos superiores */}
      <Section className='flex flex-col lg:flex-row justify-between gap-5'>
        <BoxContestInfo contestId={contest.id} />
        <BoxStudentsInfo contestId={contest.id} />
      </Section>

      {/* Blocos inferiores */}
      <Section>
        <BoxQuestions contestId={contest.id} />
      </Section>
    </Page>
  );
}