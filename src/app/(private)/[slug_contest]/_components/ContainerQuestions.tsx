'use client';

import React from 'react';
import BoxContainer from '@/components/BoxContainer';
import CardQuestion from './CardQuestion';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Question } from '../../../../../generated/prisma/client';

export default function ContainerQuestions({ 
  contestId 
}: { 
  contestId?: string | null 
}) {
  const { data, isLoading, isError } = useQuery<Question[]>({
    queryKey: ['questions', contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const res = await axios.get(`/api/questions/${contestId}`);
      // aceita duas formas de retorno da API: { questions: [...] } ou { contest: { questions: [...] } }
      const questions = res.data?.questions ?? res.data?.contest?.questions ?? [];
      return questions as Question[];
    },
    enabled: !!contestId,
    staleTime: 1000 * 30,
    refetchInterval: 10000, // refaz a cada 10s
  });

  return (
    <BoxContainer className='w-full h-full rounded-3xl space-y-3'>
      <div className='w-full flex justify-center'>
        <h1 className='text-muted-foreground text-lg'>Questões</h1>
      </div>

      {!contestId ? (
        <div className="p-4 text-muted-foreground">Competição não informada.</div>
      ) : isLoading ? (
        <div className="p-4 text-muted-foreground">Carregando questões...</div>
      ) : isError ? (
        <div className="p-4 text-destructive">Erro ao carregar questões.</div>
      ) : !(data && data.length) ? (
        <div className="p-4 text-muted-foreground">Nenhuma questão encontrada.</div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
          {data.map((q) => (
            <div key={q.id}>
              <CardQuestion question={q} />
            </div>
          ))}
        </div>
      )}
    </BoxContainer>
  );
}
