import Logo from '@/components/Logo';
import Page from '@/components/Page';
import Section from '@/components/Section';
import Image from 'next/image';
import Footer from '@/components/Footer';
import LoginForm from './_components/LoginForm';

export default function LoginPage() {
  return (
    <Page className="h-screen flex flex-col lg:flex-row">
      <Section className="overflow-hidden sm:w-full h-1/3 lg:h-full hidden sm:flex justify-center">
        <div className="relative pt-10 w-full h-full">
          <Image
            src="/thunb-login.webp"
            alt="Thumbnail da página de login"
            fill
            className="object-cover object-[60%_30%]"
            priority
          />
        </div>
      </Section>

      
      <Section className="h-full flex flex-col justify-center items-center gap-8">
        <div className='w-full flex flex-col items-center gap-2'>
          <Logo />
          <h2 className='text-muted-foreground'>
            Brazil Online Contest Administrator Kids
          </h2>
        </div>

        <div className="w-full max-w-md">
          <LoginForm />
        </div>
        
        <Footer />
      </Section>
    </Page>
  );
}