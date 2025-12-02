import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BOKINHA | Portal Administrativo',
  description: 'Portal administrativo - BOKINHA',
};

export default function NewContestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}