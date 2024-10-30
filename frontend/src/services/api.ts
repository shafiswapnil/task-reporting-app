import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { Task, NewTask, UpdateTask } from '@/types/task';
import { Session } from 'next-auth';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Custom error handler
const handleApiError = (error: any, context: string = 'API Error') => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error(`${context}:`, {
            message: axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            url: axiosError.config?.url
        });
    } else {
        console.error(`${context}:`, error);
    }
    throw error;
};

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        const session = await getSession();
        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(handleApiError(error, 'Request Interceptor Error'));
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(handleApiError(error, 'Response Interceptor Error'));
    }
);

// Task APIs
const getDeveloperTasks = async (session: Session | null) => {
    if (!session?.user?.email) {
        throw new Error('No user email found');
    }
  
    try {
        const response = await axiosInstance.get('/tasks/submitted', {
            params: {
                email: session.user.email
            }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Error fetching developer tasks');
    }
};

const createTask = async (task: NewTask): Promise<Task> => {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            throw new Error('User email not found');
        }

        const response = await axiosInstance.post('/tasks', task);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Error creating task');
    }
};

const updateTask = async (taskId: number, task: UpdateTask): Promise<Task> => {
    try {
        const response = await axiosInstance.put(`/tasks/${taskId}`, task);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Error updating task');
    }
};

const deleteTask = async (taskId: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/tasks/${taskId}`);
    } catch (error) {
        throw handleApiError(error, 'Error deleting task');
    }
};

// Admin APIs
const createAdminTask = async (task: NewTask): Promise<Task> => {
    try {
        const response = await axiosInstance.post('/tasks/admin', task);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Error creating admin task');
    }
};

const getAdminTasks = async (): Promise<Task[]> => {
    try {
        const response = await axiosInstance.get('/tasks/admin');
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Error fetching admin tasks');
    }
};

const updateAdminTask = async (taskId: number, task: UpdateTask): Promise<Task> => {
    try {
        const response = await axiosInstance.put(`/tasks/admin/${taskId}`, task);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Error updating admin task');
    }
};

const deleteAdminTask = async (taskId: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/tasks/admin/${taskId}`);
    } catch (error) {
        throw handleApiError(error, 'Error deleting admin task');
    }
};

const getDeveloperDetails = async (email: string) => {
    try {
        const response = await axiosInstance.get(`/developers/${email}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Error fetching developer details');
    }
};

// Add this to your existing API functions
const getMissingReports = async (email: string) => {
    try {
        const response = await axiosInstance.get('/reports/missing', {
            params: { email }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Error fetching missing reports');
    }
};

export {
    getDeveloperTasks,
    createTask,
    updateTask,
    deleteTask,
    createAdminTask,
    getAdminTasks,
    updateAdminTask,
    deleteAdminTask,
    getDeveloperDetails,
    getMissingReports
};

export default axiosInstance;
