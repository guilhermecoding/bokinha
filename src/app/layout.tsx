import type { Metadata } from 'next';
import { Lexend_Deca } from 'next/font/google';
import './globals.css';
import Providers from '@/providers';

const lexendDeca = Lexend_Deca({ 
  subsets: ['latin'], weight: ['400', '500', '700'] 
});

export const metadata: Metadata = {
  title: 'BOKINHA - Brazil Online Contest Administrator Kids',
  description: 'BOKINHA é uma plataforma para gerenciar competições de programação para crianças e adolescentes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="pt-BR" className={`${lexendDeca.className} antialiased`}>
        <body className='bg-gray-200'>
           <Providers>
            {children}
            <footer className='w-full my-6 flex justify-center'>
              <span className='text-muted-foreground'>Desenvolvido por <strong>João Guilherme</strong></span>
            </footer>
           </Providers>
        </body>
      </html>
  );
}
