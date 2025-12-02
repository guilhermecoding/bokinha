'use client';

import BoxContainer from '@/components/BoxContainer';
import { Button } from '@/components/ui/button';
import { IconBalloonFilled, IconEdit } from '@tabler/icons-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import updateContestSchema from '@/schemas/update-contest.schema';

type UpdateContestInput = z.infer<typeof updateContestSchema>;

export default function BoxContestInfo({
  contestId,
}: {
  contestId?: string | null;
}) {
  const queryClient = useQueryClient();
  const [openEdit, setOpenEdit] = useState(false);

  const { data: contest, isLoading } = useQuery({
    queryKey: ['contest', contestId],
    queryFn: async () => {
      if (!contestId) return null;
      const res = await axios.get(`/api/contests/${contestId}`);
      return res.data.contest as {
        id: string;
        name: string;
        slug: string;
        adminPassword?: string | null;
        startTime: string;
        endTime: string;
        createdAt: string;
        updatedAt: string;
      };
    },
    enabled: !!contestId,
  });

  const form = useForm<UpdateContestInput>({
    resolver: zodResolver(updateContestSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      adminPassword: '',
      startTime: '',
      endTime: '',
    },
  });

  useEffect(() => {
    if (contest) {
      form.reset({
        name: contest.name,
        adminPassword: contest.adminPassword ?? '',
        startTime: new Date(contest.startTime).toISOString().slice(0, 16),
        endTime: new Date(contest.endTime).toISOString().slice(0, 16),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest]);

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateContestInput) => {
      if (!contestId) throw new Error('contestId faltando');
      // envia datetime-local (YYYY-MM-DDTHH:mm) — API aceita ISO
      const body = {
        ...payload,
      };
      const { data } = await axios.patch(`/api/contests/${contestId}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['contest', contestId] });
      setOpenEdit(false);
    },
  });

  const isSubmitting = updateMutation.isPending;

  return (
    <BoxContainer className="w-full">
      <div className="w-full flex flex-row items-center gap-2 mb-4">
        <IconBalloonFilled className="w-5 h-5 sm:w-6 sm:h-6" />
        <h2 className="font-bold text-lg sm:text-2xl">Detalhes da Competição</h2>
        <div className="ml-auto">
          <Button variant="ghost" onClick={() => setOpenEdit(true)}>
            <IconEdit />
            <span className="ml-2">Editar</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : !contest ? (
        <p>Competição não encontrada.</p>
      ) : (
        <div className="space-y-2">
          <div><strong>Nome:</strong> {contest.name}</div>
          <div><strong>Slug:</strong> {contest.slug}</div>
          <div><strong>Início:</strong> {new Date(contest.startTime).toLocaleString()}</div>
          <div><strong>Fim:</strong> {new Date(contest.endTime).toLocaleString()}</div>
          <div><strong>Criado em:</strong> {new Date(contest.createdAt).toLocaleString()}</div>
        </div>
      )}

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Competição</DialogTitle>
            <DialogDescription className="sr-only">Formulário de edição</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => {
                // converter inputs datetime-local para ISO completo
                const payload = {
                  ...d,
                  startTime: new Date(d.startTime).toISOString(),
                  endTime: new Date(d.endTime).toISOString(),
                };
                updateMutation.mutate(payload as UpdateContestInput);
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <input {...field} className="w-full rounded-md border px-3 py-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha de Admin</FormLabel>
                    <FormControl>
                      <input {...field} type="password" className="w-full rounded-md border px-3 py-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
                      <FormControl>
                        <input {...field} type="datetime-local" className="w-full rounded-md border px-3 py-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim</FormLabel>
                      <FormControl>
                        <input {...field} type="datetime-local" className="w-full rounded-md border px-3 py-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenEdit(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </BoxContainer>
  );
}
