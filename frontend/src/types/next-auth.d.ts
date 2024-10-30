import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
    };
    accessToken: string;
    expires: string;
  }

  interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    email: string;
    accessToken: string;
    role: string;
  }
}
