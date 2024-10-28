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

// Response interceptor (optional for global error handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific status codes if needed
        return Promise.reject(error);
    }
);

// -------------------
// Developer API Methods
// -------------------

// Submit a new task (Developer)
export const submitTask = async (taskData: {
    date: string;
    targetsGiven: string;
    targetsAchieved: string;
    status: string;
}) => {
    const res = await api.post('/tasks', taskData);
    return res.data;
};

// Fetch submitted tasks (Developer)
export const fetchSubmittedTasks = async () => {
    const res = await api.get('/tasks/submitted');
    return res.data;
};

// -------------------
// Admin API Methods
// -------------------

// Create a new task (Admin)
export const createAdminTask = async (taskData: {
    developerId: number;
    date: string;
    project: string;
    role: string;
    team: string;
    targetsGiven: string;
    targetsAchieved: string;
    status: string;
}) => {
    const res = await api.post('/tasks/admin', taskData);
    return res.data;
};

// Fetch all tasks (Admin)
export const fetchAllAdminTasks = async () => {
    const res = await api.get('/tasks/admin');
    return res.data;
};

// Update a task (Admin)
export const updateAdminTask = async (taskId: number, taskData: {
    developerId: number;
    date: string;
    project: string;
    role: string;
    team: string;
    targetsGiven: string;
    targetsAchieved: string;
    status: string;
}) => {
    const res = await api.put(`/tasks/admin/${taskId}`, taskData);
    return res.data;
};

// Delete a task (Admin)
export const deleteAdminTask = async (taskId: number) => {
    const res = await api.delete(`/tasks/admin/${taskId}`);
    return res.data;
};

// Fetch developer details
export const getDeveloperDetails = async (email: string) => {
    const res = await api.get(`/developers?email=${encodeURIComponent(email)}`);
    return res.data;
};

// -------------------
// General API Methods
// -------------------

// Add other API methods as needed

export default api;
