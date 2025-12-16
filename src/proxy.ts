import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from '../generated/prisma/enums';

export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname;

    // 1️⃣ Rotas públicas que não precisam de autenticação
    const publicPaths = ['/', '/login'];
    if (publicPaths.some(p => path === p)) {
      return NextResponse.next();
    }

    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      
      if (!token) return NextResponse.next();

      // 2️⃣ Redireciona ADMIN para /admin se não estiver lá
      if (token.role === Role.ADMIN && !path.startsWith('/admin')) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }

      // 3️⃣ Redireciona STUDENT para /team/{slug} se não estiver lá
      if (token.role !== Role.ADMIN && !path.startsWith('/team')) {
        const url = req.nextUrl.clone();
        url.pathname = `/team/${token.contestSlug}`;
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Middleware error:', error);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // ✅ Liberar acesso público
        if (path === '/' || path === '/login' || path.startsWith('/placar')) {
          return true;
        }

        const isLoggedIn = !!token;

        // ADMIN só para /admin
        if (path.startsWith('/admin')) {
          return isLoggedIn && token?.role === Role.ADMIN;
        }

        // STUDENT só para /team
        if (path.startsWith('/team')) {
          return isLoggedIn && token?.role !== Role.ADMIN;
        }

        // Demais rotas precisam estar logadas
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
    // ✅ Exclui explicitamente /login do matcher
    '/((?!^/$|^/login$|^/placar|api|_next/static|_next/image|favicon.ico).*)',
  ],
};