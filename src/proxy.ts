import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname;

    // 1️⃣ Rotas públicas que não devem ser redirecionadas
    const publicPaths = ['/placar'];
    if (publicPaths.some(p => path.startsWith(p))) {
      return NextResponse.next();
    }

    // 2️⃣ Só redireciona admin se não estiver em /admin
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.role === 'ADMIN' && !path.startsWith('/admin')) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
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

        // liberar acesso público para /placar e subrotas
        if (path.startsWith('/placar')) return true;

        const isLoggedIn = !!token;

        // ADMIN só para /admin
        if (path.startsWith('/admin')) return isLoggedIn && token?.role === 'ADMIN';

        // Demais rotas só precisam estar logadas
        return isLoggedIn;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!^/$|^/login$|^/register$|api|_next/static|_next/image|favicon.ico).*)',
  ],
};
