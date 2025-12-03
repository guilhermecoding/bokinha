import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Providers from '@/providers';
import Header from '@/components/Header';

const poppins = Poppins({ 
  subsets: ['latin'], weight: ['400', '700'] 
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
      <html lang="pt-BR" className={`${poppins.className} antialiased`}>
        <body className='bg-gray-200'>
           <Providers>
            <Header />
            {children}
           </Providers>
        </body>
      </html>
  );
}
