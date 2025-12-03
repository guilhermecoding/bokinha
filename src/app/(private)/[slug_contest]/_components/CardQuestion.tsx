'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Balloon from '@/components/Balloon';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

type Question = {
  id: string;
  title: string;
  order?: number | null;
  balloonColor?: string | null;
  contestId?: string | null;
};

export default function CardQuestion({
  question,
}: {
  question: Question;
}) {
  const queryClient = useQueryClient();

  // verifica se a questão já foi feita pelo usuário autenticado (ou público conforme API)
  const { data: done, isLoading: loadingDone } = useQuery<boolean>({
    queryKey: ['questionSolved', question.id],
    queryFn: async () => {
      const res = await axios.get(`/api/questions/${question.id}/solved`);
      return Boolean(res.data?.done);
    },
    enabled: !!question?.id,
    staleTime: 5000,
  });

  const solveMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/questions/${question.id}/solve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionSolved', question.id] });
      queryClient.invalidateQueries({ queryKey: ['scoreboard', question.contestId] });
      queryClient.invalidateQueries({ queryKey: ['questions', question.contestId] });
    },
  });

  return (
    <div className="border border-gray-300 px-8 py-4 rounded-3xl flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-muted-foreground">Questão {question.order}</h2>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Balloon color={question.balloonColor} /> {question.title}
        </h2>
      </div>

      <div className="flex items-center justify-end">
        {loadingDone ? (
          <div className="text-sm text-muted-foreground">carregando…</div>
        ) : done ? (
          <div className="text-sm text-green-600 font-semibold">Feito</div>
        ) : (
          <Button
            className="w-full bg-purple-800 hover:bg-purple-900 cursor-pointer"
            onClick={() => solveMutation.mutate()}
            disabled={solveMutation.isPending}
          >
            {solveMutation.isPending ? 'Enviando...' : 'Terminei'}
          </Button>
        )}
      </div>
    </div>
  );
}
