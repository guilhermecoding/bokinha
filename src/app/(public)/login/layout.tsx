import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'BOKINHA - Login',
  description: 'BOKINHA é uma plataforma para gerenciar competições de programação para crianças e adolescentes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
