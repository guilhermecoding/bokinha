'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Balloon from '@/components/Balloon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import conffets from '@/components/conffets';

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
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // busca se a questão já foi feita pelo usuário (API deve responder { done: boolean })
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
      setOpen(false);
      setPassword('');
      setError(null);
      conffets();
    },
    onError: () => {
      setError('Erro ao marcar como feito');
    },
  });

  async function handleConfirm() {
    setError(null);
    if (!password.trim()) {
      setError('Informe a senha');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/confirm-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? 'Erro ao confirmar senha');
        return;
      }

      if (data?.valid) {
        // confirma e marca questão como resolvida
        await solveMutation.mutateAsync();
        return;
      } else {
        setError('Senha inválida');
      }
    } catch {
      setError('Erro na requisição');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-gray-300 px-8 py-4 rounded-3xl flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-muted-foreground">Questão {question.order}</h2>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Balloon color={question.balloonColor} /> {question.title}
        </h2>
      </div>

      <div className="flex w-full items-center justify-center">
        {loadingDone ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : done ? (
          <div className="text-sm text-green-600 font-semibold">Feito</div>
        ) : (
          <Button
            className="w-full bg-purple-800 hover:bg-purple-900 cursor-pointer"
            onClick={() => {
              setError(null);
              setPassword('');
              setOpen(true);
            }}
          >
            Terminei
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha de Admin</DialogTitle>
            <DialogDescription>
              Informe a senha de administrador da competição para confirmar a ação.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Senha de admin"
              autoFocus
            />
            {error && <div className="text-sm text-destructive mt-2">{error}</div>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={loading || !password.trim()}>
              {loading ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
