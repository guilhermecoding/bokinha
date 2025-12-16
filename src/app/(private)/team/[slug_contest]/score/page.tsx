import ScoreboardPage from '@/components/ScoreboardPage/ScoreBoardPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BOKINHA - Placar',
  description: 'Placar detalhado do contest.',
};

export default async function TeamScoreboardPage({
  params
}: {
  params: Promise<{ slug_contest: string }>
}) {
  const { slug_contest: slugContest } = await params;
  
  return <ScoreboardPage slugContest={slugContest} />;
}
