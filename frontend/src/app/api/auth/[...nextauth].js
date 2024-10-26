import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.developer.findUnique({
          where: { email: credentials.email },
        });

        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);