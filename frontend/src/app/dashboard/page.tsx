"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import MissingReportsCalendar from '@/components/MissingReportsCalendar';
import { Task } from '@/types/task';
import { getDeveloperTasks, createTask, updateTask, deleteTask } from '@/services/api';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // First useEffect for authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (status === 'authenticated') {
      setIsPageLoading(false);
    }
  }, [isLoading, isAuthenticated, status, router]);

  // Separate useEffect for fetching tasks
  useEffect(() => {
    const loadTasks = async () => {
      if (session?.user?.email) {
        try {
          await fetchTasks();
        } catch (error) {
          console.error('Error loading tasks:', error);
          setError('Failed to load tasks');
        }
      }
    };

    loadTasks();
  }, [session]); // Only depend on session

  if (isPageLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getDeveloperTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await createTask(taskData);
      await fetchTasks();
      setError(null);
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: number, taskData: Partial<Task>) => {
    try {
      await updateTask(taskId, taskData);
      await fetchTasks();
      setError(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      await fetchTasks();
      setError(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Developer Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Submit New Task</h2>
            <TaskForm onSubmit={handleCreateTask} />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Missing Reports</h2>
            <MissingReportsCalendar />
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
          <TaskList 
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>
    </div>
  );
}
