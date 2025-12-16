import ScoreboardPage from '@/components/ScoreboardPage/ScoreBoardPage';

export default async function TeamScoreboardPage({
  params
}: {
  params: Promise<{ slug_contest: string }>
}) {
  const { slug_contest: slugContest } = await params;
  
  return <ScoreboardPage slugContest={slugContest} />;
}
