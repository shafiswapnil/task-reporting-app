import axios from 'axios';
import { getSession } from 'next-auth/react';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api',
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle specific status codes here
    return Promise.reject(error);
  }
);

// Export API methods

export const getTasks = async () => {
  const res = await api.get('/tasks');
  return res.data;
};

export const deleteTask = async (taskId: number) => {
  const res = await api.delete(`/tasks/${taskId}`);
  return res.data;
};

export const createTask = async (taskData: any) => {
  const res = await api.post('/tasks', taskData);
  return res.data;
};

export const updateTask = async (taskId: number, taskData: any) => {
  const res = await api.put(`/tasks/${taskId}`, taskData);
  return res.data;
};

// Admin-specific API methods

export const getAdminTasks = async () => {
  const res = await api.get('/tasks/admin');
  return res.data;
};

export const createAdminTask = async (taskData: any) => {
  const res = await api.post('/tasks/admin', taskData);
  return res.data;
};

export const updateAdminTask = async (taskId: number, taskData: any) => {
  const res = await api.put(`/tasks/admin/${taskId}`, taskData);
  return res.data;
};

export const deleteAdminTask = async (taskId: number) => {
  const res = await api.delete(`/tasks/admin/${taskId}`);
  return res.data;
};

export const getDeveloperDetails = async (email: string) => {
  const res = await api.get(`/developers?email=${encodeURIComponent(email)}`);
  return res.data;
};

// Additional API methods as needed

export default api;
