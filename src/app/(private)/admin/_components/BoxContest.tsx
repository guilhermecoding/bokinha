'use client';

import { Button } from '@/components/ui/button';
import { IconEyeFilled, IconHexagonPlusFilled, IconTrashFilled } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import createContestSchema from '@/schemas/create-contest.schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contest } from '../../../../../generated/prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function CardCreateContest({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    // Esquema do formulário
    const formCreateContest = useForm<z.infer<typeof createContestSchema>>({
        resolver: zodResolver(createContestSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            adminPassword: '',
            startTime: '',
            endTime: ''
        }
    });

    const queryClient = useQueryClient();

    const createContestMutation = useMutation({
      mutationFn: async (payload: z.infer<typeof createContestSchema>) => {
        const { data } = await axios.post('/api/contests', payload);
        return data;
      },
      onSuccess: () => {
        // revalida a query de competições
        queryClient.invalidateQueries({ queryKey: ['contests'] });
        // resetar formulário e fechar dialog
        formCreateContest.reset();
        setOpen(false);
      },
    });

    // Limpa inputs quando o diálogo fechar
    useEffect(() => {
      if (!open) {
        formCreateContest.reset();
      }
    }, [open, formCreateContest]);

    // Envio do formulário via mutation
    function onSubmitCreateContest(data: z.infer<typeof createContestSchema>) {
        createContestMutation.mutate(data);
    }

    const isValid = formCreateContest.formState.isValid;
    const isSubmitting = createContestMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Nova Competição</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Card para criar novas competições
                    </DialogDescription>
                </DialogHeader>

                {/* Conteúdo do Card */}
                <Form {...formCreateContest}>
                    <form onSubmit={formCreateContest.handleSubmit(onSubmitCreateContest)} className="space-y-4">
                        <FormField
                            control={formCreateContest.control}
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
                            control={formCreateContest.control}
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
                                control={formCreateContest.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Início</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="datetime-local"
                                                required
                                                aria-invalid={!!formCreateContest.formState.errors.startTime}
                                                className="w-full rounded-md border px-3 py-2"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formCreateContest.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fim</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="datetime-local"
                                                required
                                                aria-invalid={!!formCreateContest.formState.errors.endTime}
                                                className="w-full rounded-md border px-3 py-2"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
                

            <DialogFooter>
                <Button 
                    variant='outline' 
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>

                <Button
                    variant='default'
                    onClick={formCreateContest.handleSubmit(onSubmitCreateContest)}
                    disabled={!isValid || isSubmitting}
                    aria-disabled={!isValid || isSubmitting}
                    className='bg-purple-800 hover:bg-pruple-900 hover:cursor-pointer'
                >
                    {isSubmitting ? 'Criando...' : 'Criar'}
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// substitui a versão anterior de CardDeleteContest por uma que usa mutate para deletar
function CardDeleteContest({
    openCardDelete,
    setOpenCardDelete,
    contestId,
    contestName,
}: {
    openCardDelete: boolean;
    setOpenCardDelete: (openCardDelete: boolean) => void;
    contestId: string | null;
    contestName?: string;
}) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        const { data } = await axios.delete(`/api/contests/${id}`);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contests'] });
        setOpenCardDelete(false);
      },
    });

    const isDeleting = deleteMutation.isPending;

    async function handleDelete() {
      if (!contestId) return;
      deleteMutation.mutate(contestId);
    }

    return (
        <Dialog open={openCardDelete} onOpenChange={setOpenCardDelete}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir Competição</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Confirmação de exclusão da competição
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <p>Tem certeza que deseja excluir a competição <strong>{contestName}</strong>?</p>
                </div>

            <DialogFooter>
                <Button 
                    variant='outline' 
                    onClick={() => setOpenCardDelete(false)}
                    disabled={isDeleting}
                >
                    Cancelar
                </Button>

                <Button
                    variant='destructive'
                    onClick={handleDelete}
                    disabled={isDeleting || !contestId}
                    aria-disabled={isDeleting || !contestId}
                >
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Exibe a lista de competições e permite criar novas competições.
 */

export default function BoxContest() {
    const [open, setOpen] = useState<boolean>(false);

    // estados para o modal de delete
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');

    const router = useRouter();

    const {data, isLoading } = useQuery<Contest[]>({
        queryKey: ['contests'],
        queryFn: async () => {
            const { data } = await axios.get('/api/contests');
            return data.contests as Contest[];
        },
    });

    return (
        <>
            <div className='bg-white p-6 border border-muted-foreground rounded-md'>
                {/* Header Section */}
                <div className='flex flex-row justify-between items-center'>
                    <h2 className="font-bold text-2xl sm:text-3xl">Competições</h2>
                    <Button 
                        variant="default" className='bg-purple-800 text-base p-6 hover:bg-purple-900 hover:cursor-pointer'
                        onClick={() => setOpen(true)}
                    >
                        <IconHexagonPlusFilled className="mr-2 h-5 w-5" />
                        Criar
                    </Button>
                </div>

                {/* Content Section */}
                <div className='flex flex-col items-center mt-10'>
                    {isLoading ? (
                        <p className='text-muted-foreground mt-4'>Carregando...</p>
                    ) : (!data || data.length === 0) ? (
                        <p className='text-muted-foreground mt-4'>Nenhuma competição criada ainda.</p>
                    ) : (
                        <ul className='w-full space-y-2'>
                            {data.map((contest) => (
                                <li key={contest.id} className='w-full border rounded-md p-4'>
                                    <div className='flex justify-between items-center'>
                                        <div>
                                          <div className='font-medium'>{contest.name}</div>
                                          <div className='text-sm text-muted-foreground'>
                                            Início: {new Date(contest.startTime).toLocaleString()} | 
                                            Témino: {new Date(contest.endTime).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                              variant='ghost'
                                              title="Visualizar"
                                              onClick={() => router.push(`/admin/contest/${contest.slug}`)}
                                            >
                                                <IconEyeFilled />
                                            </Button>

                                            <Button
                                              variant='ghost'
                                              title="Excluir"
                                              onClick={() => {
                                                setDeleteId(contest.id);
                                                setDeleteName(contest.name);
                                                setOpenDelete(true);
                                              }}
                                            >
                                                <IconTrashFilled color='red' />
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <CardCreateContest open={open} setOpen={setOpen} />
            <CardDeleteContest
              openCardDelete={openDelete}
              setOpenCardDelete={setOpenDelete}
              contestId={deleteId}
              contestName={deleteName}
            />
        </>
    );
}