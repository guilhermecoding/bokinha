import ScoreboardPage from '@/components/ScoreboardPage/ScoreBoardPage';

export default async function TeamScoreboardPage({
  params
}: {
  params: Promise<{ slugContest: string }>
}) {
  const { slugContest } = await params;
  return <ScoreboardPage slugContest={slugContest} />;
}
