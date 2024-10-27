import { useState, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface ApiError {
  message: string;
  status: number;
}

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { data: session } = useSession();

  const request = useCallback(async (url: string, method: string, data: any = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`,
        method,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setLoading(false);
      setError({
        message: err.response?.data?.message || 'An error occurred',
        status: err.response?.status || 500
      });
      throw err;
    }
  }, [session]);

  return { loading, error, request };
};

export default useApi;
