'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Balloon from '@/components/Balloon';

type Question = {
  id: string;
  title: string;
  order: number;
};

type User = {
  id: string;
  name: string;
  email?: string;
};

type SolvedItem = {
  id: string;
  questionId: string;
  solvedAt: string;
  balloonColor?: string | null;
};

type ScoreEntry = {
  user: User;
  solvedCount: number;
  lastSolvedAt: string | null;
  solvedQuestions: SolvedItem[];
};

export default function Scoreboard({ contestId }: { contestId?: string | null }) {

  // perguntas (para montar colunas)
  const questionsQuery = useQuery<Question[]>({
    queryKey: ['questions', contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const res = await axios.get(`/api/questions/${contestId}`);
      return res.data.questions as Question[];
    },
    enabled: !!contestId,
    staleTime: 1000 * 60,
  });

  // placar — refetch a cada 10s
  const scoreboardQuery = useQuery<{
    status: string;
    contest: { id: string; name: string };
    scoreboard: ScoreEntry[];
  } | null>({
    queryKey: ['scoreboard', contestId],
    queryFn: async () => {
      if (!contestId) return null;
      const res = await axios.get(`/api/contests/${contestId}/scoreboard`);
      return res.data;
    },
    enabled: !!contestId,
    refetchInterval: 10000, // 10 segundos
    staleTime: 5000,
  });

  // derive lastUpdate from scoreboardQuery to avoid setState in an effect
  const lastUpdate = useMemo(() => {
    return scoreboardQuery.data ? new Date().toLocaleTimeString() : null;
  }, [scoreboardQuery.data]);

  const questions = useMemo(() => {
    const qs = questionsQuery.data ?? [];
    return qs.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [questionsQuery.data]);

  const scoreboard = scoreboardQuery.data?.scoreboard ?? [];

  return (
    <Table className="bg-white border border-gray-400 text-lg">
      <TableCaption>
        Última atualização: {lastUpdate ?? '—'} {scoreboardQuery.isFetching ? '(atualizando...)' : ''}
      </TableCaption>

      <TableHeader>
        {/* remove efeito de hover trocando bg no header */}
        <TableRow className="bg-purple-900 hover:bg-purple-900! cursor-default">
          <TableHead className="w-[52px] text-center text-white font-bold">#</TableHead>
          <TableHead className="min-w-40 text-left text-white font-bold">Nome</TableHead>

          {questions.map((q) => (
            <TableHead key={q.id} className="min-w-[72px] text-center text-white font-bold">
              {q.order ?? '—'}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {scoreboard.length === 0 ? (
          <TableRow>
            <TableCell className="font-medium">—</TableCell>
            <TableCell>Nenhum participante</TableCell>
            {questions.map((q) => (
              <TableCell key={q.id} className="text-center">—</TableCell>
            ))}
          </TableRow>
        ) : (
          scoreboard.map((entry, idx) => {
            // mapa questionId -> SolvedItem para lookup rápido (e pegar a cor)
            const solvedMap = new Map<string, SolvedItem>(
              (entry.solvedQuestions ?? []).map((s) => [s.questionId, s])
            );

            return (
              <TableRow key={entry.user.id}>
                <TableCell className="font-medium text-center">{idx + 1}</TableCell>
                <TableCell>{entry.user.name}</TableCell>

                {questions.map((q) => {
                  const solved = solvedMap.get(q.id);
                  return (
                    <TableCell key={q.id} className="text-center">
                      {solved ? (
                        <div className='w-full flex justify-center'>
                          <Balloon color={solved.balloonColor ?? undefined} />
                        </div>
                      ) : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}