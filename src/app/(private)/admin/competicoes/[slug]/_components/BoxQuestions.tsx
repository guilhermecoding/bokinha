'use client';

import { useEffect, useState } from 'react';
import BoxContainer from '@/components/BoxContainer';
import { Button } from '@/components/ui/button';
import { IconCirclePlus, IconVersionsFilled, IconPlus } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import z from 'zod';
import questionCreateSchema from '@/schemas/quetion-create.schema';

type QuestionCreateInput = z.infer<typeof questionCreateSchema>;

function DialogAddQuestion({
  open,
  setOpen,
  contestId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  contestId?: string | null;
}) {
  const queryClient = useQueryClient();

  const form = useForm<QuestionCreateInput>({
    resolver: zodResolver(questionCreateSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      order: undefined,
      balloonColor: '#ffffff',
      contestId: contestId ?? undefined,
    },
  });

  useEffect(() => {
    if (!open) form.reset();
    // quando contestId muda, atualizar valor inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contestId]);

  const createMutation = useMutation({
    mutationFn: async (payload: QuestionCreateInput) => {
      const { data } = await axios.post('/api/questions', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', contestId] });
      form.reset();
      setOpen(false);
    },
  });

  const isSubmitting = createMutation.isPending;
  const isValid = form.formState.isValid;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Questão</DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para criação de nova questão
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((d) =>
              createMutation.mutate({
                ...d,
                order: d.order === undefined ? undefined : Number(d.order),
                contestId: contestId ?? d.contestId ?? undefined,
              })
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <input {...field} required className="w-full rounded-md border px-3 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="balloonColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor do Balão (hex)</FormLabel>
                    <FormControl>
                      <input {...field} className="w-full rounded-md border px-3 py-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Criando...' : (<><IconPlus className="mr-2" /> Criar</>)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function BoxQuestions({ 
    contestId 
}: { 
    contestId?: string | null 
}) {
  const [openAddQ, setOpenAddQ] = useState(false);

  const { data: questions, isLoading, isError } = useQuery({
    queryKey: ['questions', contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const res = await axios.get(`/api/questions/${contestId}`);
      return res.data.questions as Array<{
        id: string;
        title: string;
        order: number;
        balloonColor?: string | null;
        contestId?: string | null;
      }>;
    },
    enabled: !!contestId,
    staleTime: 1000 * 60,
  });

  return (
    <BoxContainer>
      {/* Header Section */}
      <div className="w-full flex flex-row items-center gap-2 mb-4">
        <IconVersionsFilled className="w-5 h-5 sm:w-6 sm:h-6" />
        <h2 className="font-bold text-lg sm:text-2xl">Questões</h2>
        <div className="ml-auto">
          <Button
            variant="default"
            className="bg-green-600 text-base p-6 hover:bg-green-700 hover:cursor-pointer"
            onClick={() => setOpenAddQ(true)}
          >
            <IconCirclePlus className="mr-2 h-5 w-5" />
            Adicionar Questão
          </Button>
        </div>
      </div>

      <div className="w-full">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando questões...</p>
        ) : isError ? (
          <p className="text-destructive">Erro ao carregar questões.</p>
        ) : !questions || questions.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma questão encontrada.</p>
        ) : (
          <ul className="w-full space-y-2">
            {questions
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((q) => (
                <li key={q.id} className="w-full border rounded-md p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">#{q.order ?? 0} — {q.title}</div>
                    <div className="text-sm text-muted-foreground">Cor: {q.balloonColor ?? '—'}</div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      <DialogAddQuestion open={openAddQ} setOpen={setOpenAddQ} contestId={contestId} />
    </BoxContainer>
  );
}
