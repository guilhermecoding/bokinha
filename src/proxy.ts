// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from '../generated/prisma/enums';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1️⃣ ROTAS SEMPRE PÚBLICAS (NUNCA PASSAM POR AUTH)
  if (
    path === '/' ||
    path === '/login' ||
    path.startsWith('/og') ||
    path.startsWith('/api/og') ||
    path.startsWith('/_next') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 2️⃣ NÃO LOGADO → LOGIN
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 3️⃣ ADMIN
  if (token.role === Role.ADMIN) {
    if (!path.startsWith('/admin')) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4️⃣ STUDENT
  if (!path.startsWith('/team')) {
    const url = req.nextUrl.clone();
    url.pathname = `/team/${token.contestSlug}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)',
  ],
};
