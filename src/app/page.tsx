import { redirect } from 'next/navigation';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Home() {
  const session: Session | null = await getServerSession(authOptions);

  // Não está logado → redireciona para /login
  if (!session) {
    redirect('/login');
  }

  // Está logado → redireciona baseado no role
  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  }

  if (session.user.contestSlug) {
    redirect(`/team/${session.user.contestSlug}`);
  }

  // Fallback caso não tenha contestSlug
  redirect('/login');
}