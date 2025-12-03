import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BOKINHA - Placar',
  description: 'Placar detalhado do contest.',
};

export default function PlacarLayout({
    children
}: {
    children: React.ReactNode
}) {
    return children;
}