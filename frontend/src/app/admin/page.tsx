"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import MissingReportsCalendar from '@/components/MissingReportsCalendar';
import withAuth from '@/components/withAuth';
import { Task } from '../../types/task';
import { getAdminTasks, deleteAdminTask, createAdminTask, updateAdminTask } from '../../services/api';

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [project, setProject] = useState('');
  const [refreshTasks, setRefreshTasks] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session.user.role === 'admin') {
      fetchTasks();
    }
  }, [session, status]);

  const fetchTasks = async () => {
    try {
      const data = await getAdminTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId: number) => {
    try {
      await deleteAdminTask(taskId);
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setSelectedTask(null);
    await fetchTasks();
  };

  const handleAddTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to create task');
      }

      const resData = await response.json();
      alert(resData.message);
      setRefreshTasks(!refreshTasks);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create task');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Task Management Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Manage Tasks</h2>
        <div className="mb-6 p-4 border rounded-md bg-gray-100 dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-2">Add New Task</h3>
          <TaskForm
            onSubmit={handleAddTask}
            submitLabel="Create Task"
          />
        </div>
        <TaskList refreshTrigger={refreshTasks} setRefreshTrigger={setRefreshTasks} />
      </section>

      {/* Missing Reports Calendar - Optional */}
      <MissingReportsCalendar 
        weekdays={[]} // Ensure to pass the correct weekdays if needed
        onDateSelect={() => { /* Implement if needed */ }}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={() => {
          setSelectedTask(null);
          setShowForm(true);
        }}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Add New Task
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <TaskForm
              task={selectedTask || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedTask(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Add table headers */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id}>
                {/* Add table cells */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
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

export default withAuth(AdminDashboard, { allowedRoles: ['admin'] });
