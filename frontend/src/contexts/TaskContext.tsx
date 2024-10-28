import { createContext, useContext, useState, useCallback } from 'react';
import { Task, NewTask, UpdateTask } from '../types/task';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: NewTask) => Promise<void>;
  updateTask: (id: number, task: UpdateTask) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = async (task: NewTask) => {
    setLoading(true);
    try {
      await createTask(task);
      await fetchTasks();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskById = async (id: number, task: UpdateTask) => {
    setLoading(true);
    try {
      await updateTask(id, task);
      await fetchTasks();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskById = async (id: number) => {
    setLoading(true);
    try {
      await deleteTask(id);
      await fetchTasks();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask: updateTaskById,
        deleteTask: deleteTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}

