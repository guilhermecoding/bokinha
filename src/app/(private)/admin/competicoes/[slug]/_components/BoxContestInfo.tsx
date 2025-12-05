'use client';

import BoxContainer from '@/components/BoxContainer';
import { Button } from '@/components/ui/button';
import { IconBalloonFilled, IconEdit, IconExternalLink } from '@tabler/icons-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import updateContestSchema from '@/schemas/update-contest.schema';
import Link from 'next/link';

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

  // formata ISO para value de <input type="datetime-local"> no fuso local
  function toLocalDatetimeLocal(iso?: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  useEffect(() => {
    if (contest) {
      form.reset({
        name: contest.name,
        adminPassword: contest.adminPassword ?? '',
        startTime: toLocalDatetimeLocal(contest.startTime),
        endTime: toLocalDatetimeLocal(contest.endTime),
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
      <div className="w-full flex flex-row items-center justify-between gap-2 mb-4">
        <div className='w-auto flex flex-row justify-center sm:justify-start items-center gap-2'>
          <IconBalloonFilled className="w-6 h-6 sm:w-6 sm:h-6" />
          <h2 className="font-bold text-xl sm:text-2xl">Detalhes</h2>
        </div>
          <Button variant="ghost" onClick={() => setOpenEdit(true)}>
            <IconEdit />
          </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando dados da competição...</p>
      ) : !contest ? (
        <p className="text-muted-foreground">Competição não encontrada</p>
      ) : (
        <div className="space-y-2">
          <div><strong>Nome:</strong> {contest.name}</div>
          <div><strong>Slug:</strong> {contest.slug}</div>
          <div><strong>Início:</strong> {new Date(contest.startTime).toLocaleString()}</div>
          <div><strong>Fim:</strong> {new Date(contest.endTime).toLocaleString()}</div>
          <div><strong>Criado em:</strong> {new Date(contest.createdAt).toLocaleString()}</div>
          <div><strong>Última atualização:</strong> {new Date(contest.updatedAt).toLocaleString()}</div>
          <div>
            <Link className='flex items-center gap-1 text-blue-500 hover:text-blue-700' href={`/placar/${contest.slug}`} target='_blank' rel='noopener noreferrer'>
              <IconExternalLink className='w-5 h-5' /> Conferir Placar
            </Link>
          </div>
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
