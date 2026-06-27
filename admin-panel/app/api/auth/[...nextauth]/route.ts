import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Demo accounts (no backend required)
        const DEMO_ACCOUNTS = [
          { username: 'abc@digitalhujra.com', password: '12345',     id: '1', name: 'Digital Hujra Admin' },
          { username: 'admin@bayanscafe.com', password: 'admin123',  id: '2', name: 'Bayans Admin' },
          { username: 'digitalhujra',         password: '12345',     id: '3', name: 'Digital Hujra' },
        ];

        const input = credentials?.email?.trim() ?? '';
        const match = DEMO_ACCOUNTS.find(
          (a) => a.username === input && a.password === credentials?.password
        );
        if (match) {
          return { id: match.id, name: match.name, email: input, token: 'demo-token' };
        }

        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            { email: input, password: credentials?.password }
          );
          const { token, user } = res.data;
          if (token && user) return { ...user, token };
        } catch {
          // API unavailable — demo accounts above handle offline login
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.accessToken = (user as any).token;
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});

export { handler as GET, handler as POST };
