import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { Task, NewTask, UpdateTask } from '@/types/task';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Custom error handler
const handleApiError = (error: any, context: string) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error(`${context}:`, {
            message: axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data
        });
    } else {
        console.error(`${context}:`, error);
    }
    throw error;
};

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const session = await getSession();
            if (session?.user?.accessToken) {
                config.headers = config.headers || {};
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
            // Only redirect if we're in a browser environment
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Developer API Methods
const getDeveloperTasks = async (): Promise<Task[]> => {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            throw new Error('User email not found');
        }
        // Get tasks for the specific developer
        const response = await axiosInstance.get<Task[]>(`/tasks?email=${encodeURIComponent(session.user.email)}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Error fetching tasks');
    }
};

const createTask = async (taskData: Partial<NewTask>): Promise<Task> => {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            throw new Error('User email not found');
        }

        // Validate required fields
        if (!taskData.date || !taskData.project || !taskData.targetsGiven) {
            throw new Error('Missing required fields');
        }

        const fullTaskData = {
            ...taskData,
            developerEmail: session.user.email, // Always use the logged-in user's email
            status: taskData.status || 'Pending' as TaskStatus
        };

        const response = await axiosInstance.post<Task>('/tasks', fullTaskData);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Error creating task');
    }
};

// const updateTask = async (taskId: string, taskData: Partial<UpdateTask>): Promise<Task> => {
//     try {
//         const session = await getSession();
//         if (!session?.user?.email) {
//             throw new Error('User email not found');
//         }

//         // First verify if the task belongs to the developer
//         const currentTask = await axiosInstance.get<Task>(`/tasks/${taskId}`);
//         if (currentTask.data.developerEmail !== session.user.email) {
//             throw new Error('Unauthorized: Cannot update task that belongs to another developer');
//         }

//         const fullTaskData = {
//             ...taskData,
//             developerEmail: session.user.email // Ensure developer email remains unchanged
//         };

//         const response = await axiosInstance.put<Task>(`/tasks/${taskId}`, fullTaskData);
//         return response.data;
//     } catch (error) {
//         return handleApiError(error, 'Error updating task');
//     }
// };
const updateTask = async (taskId: string, taskData: Partial<UpdateTask>): Promise<Task> => {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            throw new Error('User email not found');
        }

        const response = await axiosInstance.put<Task>(`/tasks/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Error updating task');
    }
};

const deleteTask = async (taskId: string): Promise<void> => {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            throw new Error('User email not found');
        }

        // First verify if the task belongs to the developer
        const currentTask = await axiosInstance.get<Task>(`/tasks/${taskId}`);
        if (currentTask.data.developerEmail !== session.user.email) {
            throw new Error('Unauthorized: Cannot delete task that belongs to another developer');
        }

        await axiosInstance.delete(`/tasks/${taskId}`);
    } catch (error) {
        return handleApiError(error, 'Error deleting task');
    }
};

// Admin API Methods
const getAdminTasks = async (): Promise<Task[]> => {
    try {
        const response = await axiosInstance.get<Task[]>('/tasks/admin');
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Error fetching admin tasks');
    }
};

const createAdminTask = async (taskData: NewTask): Promise<Task> => {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            throw new Error('User email not found');
        }

        if (!taskData.developerEmail) {
            throw new Error('Developer email is required for admin task creation');
        }

        const response = await axiosInstance.post<Task>('/tasks/admin', taskData);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Error creating admin task');
    }
};

const updateAdminTask = async (taskId: number, taskData: Partial<UpdateTask>): Promise<Task> => {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            throw new Error('User email not found');
        }

        const response = await axiosInstance.put<Task>(`/tasks/admin/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Error updating admin task');
    }
};

const deleteAdminTask = async (taskId: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/tasks/admin/${taskId}`);
    } catch (error) {
        return handleApiError(error, 'Error deleting admin task');
    }
};

// Developer Profile Methods
const getDeveloperDetails = async (email: string): Promise<any> => {
    try {
        if (!email) {
            throw new Error('Email is required');
        }
        const response = await axiosInstance.get(`/developers?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Error fetching developer details');
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
