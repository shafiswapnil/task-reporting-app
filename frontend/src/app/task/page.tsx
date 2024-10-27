"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TaskStatus } from '@/types/task';
import MissingReportsCalendar from '@/components/MissingReportsCalendar';
import ErrorBoundary from '@/components/ErrorBoundary';

const TaskSubmissionPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [task, setTask] = useState({
    date: '',
    targetsGiven: '',
    targetsAchieved: '',
    status: 'Pending',
  });
  const [message, setMessage] = useState('');
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [weekdays, setWeekdays] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchSubmittedTasks();
      fetchDeveloperDetails();
    }
  }, [session]);

  const fetchDeveloperDetails = async () => {
    try {
      const response = await fetch(`/api/developers?email=${session?.user?.email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch developer details');
      }
      const data = await response.json();
      if (data) {
        setWeekdays(data.weekdays);
      }
    } catch (error) {
      console.error('Failed to fetch developer details:', error);
      setMessage('Failed to load developer details. Please try again later.');
    }
  };

  const fetchSubmittedTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?developerEmail=${session?.user?.email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setSubmittedTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setMessage('Failed to load tasks. Please try again later.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.date || !task.targetsGiven || !task.targetsAchieved) {
      setMessage('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Failed to submit task');
      }

      setMessage('Task submitted successfully');
      setTask({
        date: '',
        targetsGiven: '',
        targetsAchieved: '',
        status: 'Pending',
      });
      await fetchSubmittedTasks();
    } catch (error) {
      console.error('Error submitting task:', error);
      setMessage('Failed to submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskStatusOptions: TaskStatus[] = [
    'Completed',
    'Unfinished',
    'Pending',
    'Dependent',
    'Partially Completed'
  ];

  const handleDateSelect = (date: string) => {
    setTask(prev => ({ ...prev, date }));
    // Optionally scroll to the form
    document.getElementById('taskForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-900 rounded-md shadow-md">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold text-center">Submit Your Task</h2>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 flex items-center"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {message && <p className="text-center">{message}</p>}
        <form id="taskForm" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={task.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="targetsGiven" className="block text-sm font-medium">
              Targets Given
            </label>
            <input
              type="text"
              id="targetsGiven"
              name="targetsGiven"
              value={task.targetsGiven}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="targetsAchieved" className="block text-sm font-medium">
              Targets Achieved
            </label>
            <input
              type="text"
              id="targetsAchieved"
              name="targetsAchieved"
              value={task.targetsAchieved}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <select 
              name="status" 
              value={task.status} 
              onChange={handleChange}
              className="form-select mt-1 block w-full"
              required
            >
              <option value="">Select Status</option>
              {taskStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Task'}
          </button>
        </form>

        <MissingReportsCalendar 
          weekdays={weekdays} 
          onDateSelect={handleDateSelect} 
        />

        <div className="mt-8">
          <h3 className="text-xl font-bold">Submitted Tasks</h3>
          <ul className="mt-4 space-y-2">
            {submittedTasks.map((taskData: any, index: number) => (
              <li key={index} className="p-4 bg-gray-200 rounded-md dark:bg-gray-800">
                <p><strong>Date:</strong> {taskData.date}</p>
                <p><strong>Targets Given:</strong> {taskData.targetsGiven}</p>
                <p><strong>Targets Achieved:</strong> {taskData.targetsAchieved}</p>
                <p><strong>Status:</strong> {taskData.status}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold">Your Weekdays</h3>
          <p className="mt-2">{weekdays}</p>
        </div>
      </div>
    </div>
  );
};

const TaskSubmissionPageWrapper = () => {
  return (
    <ErrorBoundary>
      <TaskSubmissionPage />
    </ErrorBoundary>
  );
};

export default TaskSubmissionPageWrapper;
