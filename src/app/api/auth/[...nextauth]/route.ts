// auth.config.ts
import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import CredencialProvider from 'next-auth/providers/credentials';

// https://www.youtube.com/watch?v=r5bQgpqdNQc

export const authOptions: NextAuthOptions = {
  providers: [
    CredencialProvider({
        name: 'Credentials',
        credentials: {
             email: { label: 'Email', type: 'email' },
             password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
            const user = {
                id: '1',
                name: 'User Example',
                email: 'juca@gmail.com',
                password: '123456',
                role: 'admin'
            };

            const isValidEmail = user.email === credentials?.email;
            const isValidPassword = user.password === credentials?.password;

            if (!isValidEmail || !isValidPassword) {
                return null;
            }
            return user;
        }
    })
  ], // Configurado no auth.ts
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };