import { useState, useCallback } from 'react';
import axios from 'axios';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, method, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`,
        method,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    }
  }, []);

  return { loading, error, request };
};

export default useApi;

