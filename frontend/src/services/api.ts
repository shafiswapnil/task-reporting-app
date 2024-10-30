import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { Task, NewTask, UpdateTask } from '@/types/task';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Custom error handler
const handleApiError = (error: any, context: string) => {
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
        return Promise.reject(error);
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
        return Promise.reject(error);
    }
);

// Task APIs
const getDeveloperTasks = async (): Promise<Task[]> => {
    try {
        const session = await getSession();
        console.log('Current session:', session); // Debug log

        if (!session?.user?.email) {
            throw new Error('No authenticated user found');
        }

        console.log('Making API request to /tasks/submitted'); // Debug log
        const response = await axiosInstance.get('/tasks/submitted');
        console.log('API response:', response.data); // Debug log
        
        return response.data;
    } catch (error) {
        console.error('Full error in getDeveloperTasks:', error);
        throw handleApiError(error, 'Error fetching tasks');
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
        console.error('Full error:', error);
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

export {
    getDeveloperTasks,
    createTask,
    updateTask,
    deleteTask,
    createAdminTask,
    getAdminTasks,
    updateAdminTask,
    deleteAdminTask,
    getDeveloperDetails
};

export default axiosInstance;
