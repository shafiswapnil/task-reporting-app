"use client";

import { useSession } from 'next-auth/react';

export function SessionDebug() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg max-w-sm overflow-auto">
      <h3 className="font-bold mb-2">Session Debug</h3>
      <pre className="text-xs">
        {JSON.stringify(
          {
            status,
            session: {
              ...session,
              user: session?.user,
              expires: session?.expires,
              accessToken: session?.accessToken ? '[PRESENT]' : '[MISSING]'
            }
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
