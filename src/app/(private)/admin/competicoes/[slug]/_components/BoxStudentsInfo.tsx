'use client';

import BoxContainer from '@/components/BoxContainer';
import { Button } from '@/components/ui/button';
import { IconUserFilled, IconUserPlus, IconCircleMinus } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
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
import { User } from '../../../../../../../generated/prisma/browser';

const studentCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  schoolClass: z.string().optional().nullable(),
  age: z.number().int().positive().optional().nullable(),
  contestId: z.string().optional().nullable(),
});

type StudentCreateInput = z.infer<typeof studentCreateSchema>;

function DialogAddStudent({ open, setOpen, defaultContestId }: {
  open: boolean;
  setOpen: (v: boolean) => void;
  defaultContestId?: string | null;
}) {
  const queryClient = useQueryClient();

  const form = useForm<StudentCreateInput>({
    resolver: zodResolver(studentCreateSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      schoolClass: '',
      age: undefined,
      contestId: defaultContestId ?? null,
    },
  });

  // limpa inputs quando o dialog fechar
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const createMutation = useMutation({
    mutationFn: async (payload: StudentCreateInput) => {
      const { data } = await axios.post('/api/users/students', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`students/${defaultContestId}`] });
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
          <DialogTitle>Adicionar Participante</DialogTitle>
          <DialogDescription className="sr-only">Formulário para cadastrar novo estudante</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <input {...field} required className="w-full rounded-md border px-3 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input {...field} type="email" required className="w-full rounded-md border px-3 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <input {...field} type="password" required className="w-full rounded-md border px-3 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="schoolClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turma</FormLabel>
                    <FormControl>
                      <input {...field} value={field.value ?? ''} className="w-full rounded-md border px-3 py-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          // converte string para number ou undefined quando vazio
                          field.onChange(v === '' ? undefined : Number(v));
                        }}
                        className="w-full rounded-md border px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* footer buttons */}
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DialogDeleteStudent({
  open,
  setOpen,
  studentId,
  studentName,
  contestId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  studentId: string | null;
  studentName?: string;
  contestId?: string | null;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/users/students/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`students/${contestId}`] });
      setOpen(false);
    },
  });

  const isDeleting = deleteMutation.isPending;

  async function handleDelete() {
    if (!studentId) return;
    deleteMutation.mutate(studentId);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Estudante</DialogTitle>
          <DialogDescription className="sr-only">Confirmação de exclusão do estudante</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p>Tem certeza que deseja excluir o estudante <strong>{studentName}</strong>?</p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button className='cursor-pointer' variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" className='cursor-pointer hover:bg-red-700' onClick={handleDelete} disabled={isDeleting || !studentId}>
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BoxStudentsInfo({
  contestId,
}: {
  contestId?: string | null;
}) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');

  const { data, isLoading, isError } = useQuery<
    Omit<User, 'password' | 'role' | 'contestId' | 'createdAt' | 'updatedAt'>[]
  >({
    queryKey: [`students/${contestId}`],
    queryFn: async () => {
      const res = await axios.get(`/api/contests/${contestId}/students`);
      return res.data.students;
    },
    staleTime: 1000 * 60,
  });

  return (
    <BoxContainer className="w-full flex flex-col">
      {/* Cabeçalho */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-2">
          <IconUserFilled className="w-5 h-5 sm:w-6 sm:h-6" />
          <h2 className="font-bold text-xl sm:text-2xl">Alunos Participantes</h2>
        </div>
        <Button
          variant="default"
          className="w-full sm:w-auto bg-purple-800 text-base p-6 hover:bg-purple-900 hover:cursor-pointer"
          onClick={() => setOpenAdd(true)}
        >
          <IconUserPlus className="mr-2 h-5 w-5" />
          Adicionar
        </Button>
      </div>

      {/* Conteúdo: área scrollable */}
      <div className="mt-6 w-full flex-1">
        <div className="w-full h-full max-h-[40vh] overflow-auto">
         {isLoading ? (
           <p className="text-muted-foreground">Carregando alunos...</p>
         ) : isError ? (
           <p className="text-destructive">Erro ao carregar alunos.</p>
         ) : !data || data.length === 0 ? (
           <p className="text-muted-foreground">Nenhum aluno encontrado.</p>
         ) : (
           <ul className="w-full space-y-2">
             {data.map((student) => (
               <li key={student.id} className="w-full border rounded-md p-3 flex justify-between items-center">
                 <div>
                   <div className="font-medium">{student.name}</div>
                   <div className="text-sm text-muted-foreground">{student.email}</div>
                   <div className="text-sm text-muted-foreground">
                     {student.schoolClass ? `Turma: ${student.schoolClass}` : 'Sem turma'}
                     {student.age ? ` • ${student.age} anos` : ''}
                   </div>
                 </div>

                 <div className="flex items-center gap-2">
                   <Button
                     variant="ghost"
                     title="Excluir estudante"
                     onClick={() => {
                       setDeleteId(student.id);
                       setDeleteName(student.name);
                       setOpenDelete(true);
                     }}
                   >
                     <IconCircleMinus className='text-red-500' />
                   </Button>
                 </div>
               </li>
             ))}
           </ul>
         )}
        </div>
      </div>

       <DialogAddStudent open={openAdd} setOpen={setOpenAdd} defaultContestId={contestId} />
       <DialogDeleteStudent
         open={openDelete}
         setOpen={setOpenDelete}
         studentId={deleteId}
         studentName={deleteName}
         contestId={contestId}
       />
     </BoxContainer>
   );
 }
