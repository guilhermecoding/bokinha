import NextAuth, { AuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';

// ✅ Exportar authOptions como constante
export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { contest: true },
        });

        if (!user) throw new Error('Usuário não encontrado');

        const passwordMatch = await compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) throw new Error('Senha incorreta');

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          contestSlug: user.contest?.slug,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // GRAVA role e contestSlug no JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.contestSlug = user.contestSlug;
      }
      return token;
    },

    // ENVIA role e contestSlug para o client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.contestSlug = token.contestSlug as string;
      }
      return session;
    },
  },
};

// ✅ Criar handler e exportar GET e POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };