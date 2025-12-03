import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  // Função middleware (opcional, roda antes dos callbacks)
  async function middleware(req) {
    // Se for ADMIN, redireciona para /admin (a menos que já esteja em /admin)
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.role === 'ADMIN') {
        const url = req.nextUrl.clone();
        if (!url.pathname.startsWith('/admin')) {
          url.pathname = '/admin';
          return NextResponse.redirect(url);
        }
      }
    } catch {
      // não bloquear em caso de erro ao ler token
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // liberar acesso público para /placar e qualquer subrota (ex: /placar/..., /placar/abc)
        if (path.startsWith('/placar')) {
          return true;
        }

        // 1. Verifica se está logado
        const isLoggedIn = !!token;

        // 2. Regra para rotas de ADMIN
        if (path.startsWith('/admin')) {
          // Só entra se estiver logado E for ADMIN
          return isLoggedIn && token?.role === 'ADMIN';
        }

        // 3. Regra para as outras rotas do matcher (ex: /contest, /student)
        // Apenas exige que esteja logado (role não importa)
        return isLoggedIn;
      },
    },
    pages: {
      signIn: '/login', // Para onde vai se retornar false
    },
  }
);

export const config = {
  matcher: [
    '/((?!^/$|^/login$|^/register$|api|_next/static|_next/image|favicon.ico).*)',
  ],
};