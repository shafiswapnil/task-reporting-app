import 'next-auth';

declare module 'next-auth' {
  interface User {
    email: string;
    accessToken: string;
    role: string;
  }

  interface Session {
    user: {
      email: string;
      accessToken: string;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    email: string;
    accessToken: string;
    role: string;
  }
}
