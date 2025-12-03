'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Page from '@/components/Page';
import Section from '@/components/Section';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [slug, setSlug] = useState('');
  const router = useRouter();

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const s = slug.trim();
    if (!s) return;
    router.push(`/${s}`);
  }

  return (
    <Page className='h-[90vh]'>
      <Section className='w-full h-full flex flex-col justify-center items-center gap-3'>
        <Logo />
        <h1 className='text-xl mt-5'>Insira o slug da competição</h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
          <input
            type='text'
            placeholder='ex: copa-do-brasil'
            className='border bg-white border-gray-300 rounded-lg px-3 py-2 w-72 text-center'
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <Button
            type="submit"
            className='w-72 bg-purple-700 hover:bg-purple-800 cursor-pointer'
            disabled={!slug.trim()}
          >
            Entrar
          </Button>
        </form>
      </Section>
    </Page>
  );
}
