'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

import { IconLogin2 } from '@tabler/icons-react';
import { Role } from '../../../../../generated/prisma/enums';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});
type LoginInput = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // ---------------------
  // SUBMIT DO LOGIN
  // ---------------------
  async function onSubmit(values: LoginInput) {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        form.setError('email', {
          message: 'Email ou senha inválidos',
        });
        form.setError('password', {
          message: 'Verifique suas credenciais',
        });
        return;
      }

      // ✅ Busca a sessão atualizada para obter o role
      const response = await fetch('/api/auth/session');
      const session = await response.json();

      // ✅ Redireciona baseado no role
      if (session?.user?.role === Role.ADMIN) {
        router.push('/admin');
      } else if (session?.user?.contestSlug) {
        router.push(`/team/${session.user.contestSlug}`);
      } else {
        router.push('/');
      }
      
      // ✅ Force refresh para garantir que o middleware pegue o token
      router.refresh();
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Form {...form}>
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-6 rounded-2xl"
        >
            {/* EMAIL */}
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <input
                    {...field}
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full rounded-xl bg-card border-2 border-gray-300 px-3 py-3"
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            {/* SENHA */}
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                    <input
                    {...field}
                    type="password"
                    placeholder="••••••"
                    className="w-full rounded-xl bg-card border-2 border-gray-300 px-3 py-3"
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            {/* BOTÃO */}
            <div className="flex mt-10 justify-end">
            <Button
                type="submit"
                className='w-full py-6 rounded-full text-base bg-purple-700 hover:bg-purple-800 cursor-pointer'
                disabled={!form.formState.isValid || loading}
                aria-busy={loading}
            >
                {loading ? (
                <span className="inline-flex gap-2 items-center">
                    <Spinner />
                    Entrando...
                </span>
                ) : (
                <span className="inline-flex gap-2 items-center">
                    <IconLogin2 />
                    Entrar
                </span>
                )}
            </Button>
            </div>

        </form>
    </Form>
  );
}
