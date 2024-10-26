import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAuth = (WrappedComponent: React.ComponentType, allowedRoles?: string[]) => {
  return (props: any) => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const isUser = !!session?.user;
    const loading = status === "loading";
    const hasRequiredRole = allowedRoles ? allowedRoles.includes(session?.user?.role as string) : true;

    useEffect(() => {
      if (!loading && !isUser) {
        router.push("/login");
      } else if (!loading && isUser && !hasRequiredRole) {
        router.push("/unauthorized");
      }
    }, [loading, isUser, hasRequiredRole]);

    if (loading || !isUser || !hasRequiredRole) {
      return <div>Loading...</div>; // Or a proper loading component
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

