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
export default function Home() {
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
  // SUBMIT DO LOGIN REAL
  // ---------------------
  async function onSubmit(values: LoginInput) {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false, // evita redirect automático
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

      router.push('/');
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
                    <span className="inline-flex items-center">
                      <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
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
