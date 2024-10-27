import 'next-auth';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    role?: string;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    role?: string;
  }
}

