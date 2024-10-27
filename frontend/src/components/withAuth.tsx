'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = (WrappedComponent: React.ComponentType, allowedRoles?: string[]) => {
  return (props: any) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;
      if (!session) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        router.push('/unauthorized');
      }
    }, [session, status, router]);

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
