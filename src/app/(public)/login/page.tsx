'use client';

import { useState } from 'react';
import Logo from '@/components/Logo';
import Page from '@/components/Page';
import Section from '@/components/Section';
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

// ---------------------
// VALIDATION
// ---------------------
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});
type LoginInput = z.infer<typeof loginSchema>;

// ---------------------
// COMPONENTE
// ---------------------
export default function LoginPage() {
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
      if (session?.user?.role === 'ADMIN') {
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

  // ---------------------
  // UI
  // ---------------------
  return (
    <Page className="h-[90vh]">
      <Section className="w-full h-full flex flex-col justify-center items-center gap-8">
        <div className='w-full flex flex-col items-center gap-2'>
          <Logo />
          <h2 className='text-muted-foreground'>
            Brazil Online Contest Administrator Kids
          </h2>
        </div>

        <div className="w-full max-w-md">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 bg-card p-6 rounded-2xl"
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
                        className="w-full rounded-md border px-3 py-2"
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
                        placeholder="••••••••"
                        className="w-full rounded-md border px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* BOTÃO */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className='w-full bg-purple-700 hover:bg-purple-800 cursor-pointer'
                  disabled={!form.formState.isValid || loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <span className="inline-flex gap-2 items-center">
                      <Spinner />
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </Section>
    </Page>
  );
}