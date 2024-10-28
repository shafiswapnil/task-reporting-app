"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import MissingReportsCalendar from '@/components/MissingReportsCalendar';
import ErrorBoundary from '@/components/ErrorBoundary';

const UserDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({
    id: 0,
    date: new Date().toISOString().split('T')[0],
    project: '',
    targetsGiven: '',
    targetsAchieved: '',
    status: 'Pending',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else {
      fetchTasks();
    }
  }, [status, router]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Failed to submit task');
      }

      setNewTask({
        id: 0,
        date: new Date().toISOString().split('T')[0],
        project: '',
        targetsGiven: '',
        targetsAchieved: '',
        status: 'Pending',
      });
      await fetchTasks();
    } catch (error) {
      console.error('Error submitting task:', error);
      setError(error.message);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmitTask} className="mb-4">
        <h2 className="text-xl mb-2">Create New Task</h2>
        <input
          type="date"
          name="date"
          value={newTask.date}
          onChange={handleInputChange}
          required
          className="border rounded p-2 mr-2"
        />
        <input
          type="text"
          name="project"
          value={newTask.project}
          onChange={handleInputChange}
          placeholder="Project"
          required
          className="border rounded p-2 mr-2"
        />
        <input
          type="number"
          name="targetsGiven"
          value={newTask.targetsGiven}
          onChange={handleInputChange}
          placeholder="Targets Given"
          required
          className="border rounded p-2 mr-2"
        />
        <input
          type="number"
          name="targetsAchieved"
          value={newTask.targetsAchieved}
          onChange={handleInputChange}
          placeholder="Targets Achieved"
          required
          className="border rounded p-2 mr-2"
        />
        <select
          name="status"
          value={newTask.status}
          onChange={handleInputChange}
          className="border rounded p-2 mr-2"
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white rounded p-2">
          Add Task
        </button>
      </form>

      <h2 className="text-xl mb-2">Your Tasks</h2>
      <MissingReportsCalendar tasks={tasks} />
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Targets Given</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Targets Achieved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.project}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.targetsGiven}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.targetsAchieved}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDashboard;
