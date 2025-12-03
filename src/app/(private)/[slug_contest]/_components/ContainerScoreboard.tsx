'use client';

import React from 'react';
import BoxContainer from '@/components/BoxContainer';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

type ScoreEntry = {
  user: {
    id: string;
    name: string;
    schoolClass?: string | null;
  };
  solvedCount?: number;
  lastSolvedAt?: string | null;
};

export default function ContainerScoreboard({
    contestId 
}: { 
    contestId?: string | null 
}) {
  const { data, isLoading, isError, isFetching } = useQuery<ScoreEntry[]>({
    queryKey: ['scoreboard', contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const res = await axios.get(`/api/contests/${contestId}/storeboard`);
      // API pode retornar { status, contest, scoreboard }
      return (res.data?.scoreboard ?? []) as ScoreEntry[];
    },
    enabled: !!contestId,
    refetchInterval: 10000, // atualiza a cada 10s
    staleTime: 5000,
  });

  return (
    <BoxContainer className='w-full rounded-3xl flex flex-col'>
      <div className='w-full flex flex-col gap-2 justify-between items-center px-4 py-2'>
        <span className='text-muted-foreground text-lg'>Placar</span>
        <span className='text-sm text-muted-foreground'>{isFetching ? 'Atualizando…' : ''}</span>
      </div>

      {/* área scrollable com altura máxima */}
      <div className="w-full overflow-auto p-4 max-h-[60vh]">
        {isLoading ? (
          <div className="text-muted-foreground">Carregando placar...</div>
        ) : isError ? (
          <div className="text-destructive">Erro ao carregar placar.</div>
        ) : !data || data.length === 0 ? (
          <div className="text-muted-foreground">Nenhum participante</div>
        ) : (
          <div className="w-full text-left space-y-5">
              {data.map((row, idx) => (
                <div key={row.user.id} className="border-t pt-5 flex flex-row gap-3">
                  <div className="py-2 font-medium text-center text-4xl text-muted-foreground">{idx + 1}</div>
                  <div className="flex flex-col">
                    <div className="text-lg">{row.user.name}</div>
                    <div className="text-sm text-muted-foreground">Turma {row.user.schoolClass ?? '—'}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </BoxContainer>
  );
}
