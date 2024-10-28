import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { Task, NewTask, UpdateTask } from '@/types/task';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const session = await getSession();
            if (session?.user?.accessToken) {
                config.headers['Authorization'] = `Bearer ${session.user.accessToken}`;
            }
            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Developer API Methods
const getDeveloperTasks = async (): Promise<Task[]> => {
    try {
        const response = await axiosInstance.get<Task[]>('/tasks');
        return response.data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

const createTask = async (taskData: NewTask): Promise<Task> => {
    try {
        const response = await axiosInstance.post<Task>('/tasks', taskData);
        return response.data;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
};

const updateTask = async (taskId: string, taskData: Partial<UpdateTask>): Promise<Task> => {
    try {
        const response = await axiosInstance.put<Task>(`/tasks/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

const deleteTask = async (taskId: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/tasks/${taskId}`);
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

// Admin API Methods
const getAdminTasks = async (): Promise<Task[]> => {
    try {
        const response = await axiosInstance.get<Task[]>('/tasks/admin');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin tasks:', error);
        throw error;
    }
};

const createAdminTask = async (taskData: NewTask): Promise<Task> => {
    try {
        const response = await axiosInstance.post<Task>('/tasks/admin', taskData);
        return response.data;
    } catch (error) {
        console.error('Error creating admin task:', error);
        throw error;
    }
};

const updateAdminTask = async (taskId: number, taskData: Partial<UpdateTask>): Promise<Task> => {
    try {
        const response = await axiosInstance.put<Task>(`/tasks/admin/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        console.error('Error updating admin task:', error);
        throw error;
    }
};

const deleteAdminTask = async (taskId: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/tasks/admin/${taskId}`);
    } catch (error) {
        console.error('Error deleting admin task:', error);
        throw error;
    }
};

// Developer Profile Methods
const getDeveloperDetails = async (email: string) => {
    try {
        const response = await axiosInstance.get(`/developers?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching developer details:', error);
        throw error;
    }
};

export {
    axiosInstance as default,
    getDeveloperTasks,
    createTask,
    updateTask,
    deleteTask,
    createAdminTask,
    getAdminTasks,
    updateAdminTask,
    deleteAdminTask,
    getDeveloperDetails,
};