"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import MissingReportsCalendar from '@/components/MissingReportsCalendar';
import { Task, NewTask, UpdateTask } from '@/types/task';
import { getDeveloperTasks, createTask, updateTask, deleteTask } from '@/services/api';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      const fetchedTasks = await getDeveloperTasks();
      console.log('Fetched tasks:', fetchedTasks);
      setTasks(fetchedTasks);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);

    if (status === 'authenticated' && session?.user?.email) {
      fetchTasks();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const handleCreateTask = async (taskData: NewTask) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prevTasks => [...prevTasks, newTask]);
      setError(null);
      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
      return false;
    }
  };

  const handleUpdateTask = async (taskId: number, taskData: UpdateTask) => {
    try {
      const updatedTask = await updateTask(taskId, taskData);
      setTasks(prevTasks =>
        prevTasks.map(task => task.id === taskId ? updatedTask : task)
      );
      setError(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      setError(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <header className="bg-blue-500 text-white p-4 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task Reporter</h1>
          <div className="flex items-center gap-4">
            <span>Dashboard</span>
            <button 
              onClick={() => signOut()} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Developer Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Submit New Task</h2>
            <TaskForm onSubmit={handleCreateTask} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Missing Reports</h2>
            <MissingReportsCalendar />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks found. Create your first task above!</p>
          ) : (
            <TaskList
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      </div>
    </>
  );
}
