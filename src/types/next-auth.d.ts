import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    role: string;
    contestSlug?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      contestSlug: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    role?: string;
    contestSlug?: string;
  }
}
