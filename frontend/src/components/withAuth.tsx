'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface WithAuthProps {
  allowedRoles?: string[];
}

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { allowedRoles }: WithAuthProps = {}
) => {
  return function WithAuthComponent(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        router.push('/unauthorized');
      }
    }, [session, status, router]);

    if (status === 'loading') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      );
    }

    if (!session || (allowedRoles && !allowedRoles.includes(session.user.role))) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
