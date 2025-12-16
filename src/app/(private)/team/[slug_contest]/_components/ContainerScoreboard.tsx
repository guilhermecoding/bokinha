'use client';

import BoxContainer from '@/components/BoxContainer';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { IconExternalLink } from '@tabler/icons-react';

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
    contestId,
    slug
}: { 
    contestId?: string | null,
    slug: string
}) {
  const { data, isLoading, isError, isFetching } = useQuery<ScoreEntry[]>({
    queryKey: ['scoreboard', contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const res = await axios.get(`/api/contests/${contestId}/scoreboard`);
      // API pode retornar { status, contest, scoreboard }
      return (res.data?.scoreboard ?? []) as ScoreEntry[];
    },
    enabled: !!contestId,
    refetchInterval: 10000, // atualiza a cada 10s
    staleTime: 5000,
  });

  function medalColorForIndex(idx: number) {
    if (idx === 0) return '#D4AF37'; // ouro
    if (idx === 1) return '#C0C0C0'; // prata
    if (idx === 2) return '#CD7F32'; // bronze
    return undefined;
  }

  return (
    <BoxContainer className='w-full rounded-3xl flex flex-col'>
      <div className='w-full flex flex-col gap-2 justify-between items-center px-4 py-2'>
        <Link className='text-muted-foreground text-lg flex items-center' href={`/team/${slug}/score`} target='_blank' rel='noopener noreferrer'>
          Placar
          <IconExternalLink className="ml-2 w-5 h-5" />
        </Link>
        <span className={`text-sm text-muted-foreground ${isFetching ? 'visible' : 'invisible'}`}>Atualizando…</span>
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
              {data.map((row, idx) => {
                const color = medalColorForIndex(idx);
                return (
                  <div key={row.user.id} className="border-t pt-5 flex flex-row gap-3 items-center">
                    <div className="py-2 font-medium text-center text-4xl text-muted-foreground">
                      {color ? (
                        <span
                          className="inline-flex items-center justify-center w-12 h-12 text-white rounded-full shadow"
                          style={{ backgroundColor: color }}
                        >
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-12 h-12 text-muted-foreground rounded-full">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="text-lg">{row.user.name}</div>
                      <div className="text-sm text-muted-foreground">Turma {row.user.schoolClass ?? '—'}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </BoxContainer>
  );
}
