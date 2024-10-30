import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      email: string;
      name?: string;
      image?: string;
    };
  }

  interface User {
    id: string | number;
    email: string;
    token: string;
    role: string;
    name?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    email: string;
    accessToken: string;
    role: string;
  }
}
