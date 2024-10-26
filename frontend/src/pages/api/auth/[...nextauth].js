import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL;

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${BACKEND_URL}/api/auth/login`, credentials);
          if (res.data) {
            return { ...res.data.user, accessToken: res.data.token };
          }
          return null;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
});
