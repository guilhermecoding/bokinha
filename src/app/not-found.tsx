import Logo from '@/components/Logo';
import Page from '@/components/Page';
import Section from '@/components/Section';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Page className='h-screen'>
        <Section className='w-full h-full flex flex-col justify-center items-center'>
            <Logo />

            <h1 className='text-2xl mt-5'>
                Ops! Página não encontrada.
            </h1>
            <h3 className='text-muted-foreground mt-3'>
                Talvez seja melhor voltarmos ao <Link href="/" className='text-blue-600'>ponto inicial</Link>.
            </h3>
        </Section>
    </Page>
  );
}
