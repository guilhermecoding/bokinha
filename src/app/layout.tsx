import type { Metadata } from 'next';
import { Lexend_Deca } from 'next/font/google';
import './globals.css';
import Providers from '@/providers';

const lexendDeca = Lexend_Deca({ 
  subsets: ['latin'], weight: ['400', '500', '700'] 
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bokinha.guilhermecoding.com'),

  title: {
    default: 'BOKINHA - Brasil Online Contest Administrator Kids',
    template: '%s | BOKINHA - Brasil Online Contest Administrator Kids',
  },
  description: 'BOKINHA é uma plataforma para gerenciar competições de programação para crianças e adolescentes, com o objetivo de facilitar a gestão de conclusão de exercícios resolvidos.',
  openGraph: {
    title: 'BOKINHA - Brasil Online Contest Administrator Kids',
    description: 'BOKINHA é uma plataforma para gerenciar competições de programação para crianças e adolescentes, com o objetivo de facilitar a gestão de conclusão de exercícios resolvidos.',
    url: 'https://bokinha.guilhermecoding.com',
    siteName: 'BOKINHA - Brasil Online Contest Administrator Kids',
    images: [
      {
        url: 'og-bokinha.jpg',
        width: 1200,
        height: 630,
        alt: 'Open Graph do BOKINHA.'
      }
    ],
    locale: 'pt-BR',
    type: 'website'
  }
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
              <span className='text-sm text-muted-foreground'>Desenvolvido por <strong>João Guilherme</strong> &copy; {new Date().getFullYear()} - v1.1.0</span>
            </footer>
           </Providers>
        </body>
      </html>
  );
}
