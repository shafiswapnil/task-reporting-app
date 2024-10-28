"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
}>({
  isAuthenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setIsAuthenticated(status === 'authenticated');
    }
  }, [status]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
