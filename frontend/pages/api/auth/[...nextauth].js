import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

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
          const res = await axios.post(`${process.env.BACKEND_URL}/api/auth/login`, credentials);
          if (res.data) {
            return { ...res.data.user, accessToken: res.data.token };
          }
          return null;
        } catch (error) {
          throw new Error(error.response?.data?.msg || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
});
