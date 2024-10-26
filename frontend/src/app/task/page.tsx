"use client";

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const TaskSubmissionPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email || '';
  const [taskData, setTaskData] = useState({
    date: '',
    targetsGiven: '',
    targetsAchieved: '',
    status: 'Pending',
  });
  const [message, setMessage] = useState('');
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [weekdays, setWeekdays] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    if (session && session.user && session.user.email) {
      fetchSubmittedTasks();
      fetchDeveloperDetails();
    }
  }, [session]);

  const fetchDeveloperDetails = async () => {
    try {
      const response = await axios.get('/api/developers', {
        params: {
          email: userEmail,
        },
      });
      if (response.data) {
        setWeekdays(response.data.weekdays);
      }
    } catch (error) {
      console.error('Failed to fetch developer details:', error);
    }
  };

  const fetchSubmittedTasks = async () => {
    try {
      const response = await axios.get('/api/tasks', {
        params: {
          developerEmail: userEmail,
        },
      });
      setSubmittedTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!userEmail) {
      setMessage('You need to be logged in to submit a task.');
      return;
    }

    try {
      await axios.post('/api/tasks', {
        developerEmail: userEmail,
        ...taskData,
      });
      setMessage('Task submitted successfully!');
      setTaskData({ date: '', targetsGiven: '', targetsAchieved: '', status: 'Pending' });
      fetchSubmittedTasks();
    } catch (error) {
      setMessage('Failed to submit task. Please try again.');
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={taskData.date}
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
              value={taskData.targetsGiven}
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
              value={taskData.targetsAchieved}
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
              id="status"
              name="status"
              value={taskData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Unfinished">Unfinished</option>
              <option value="Dependent">Dependent</option>
              <option value="Partially Completed">Partially Completed</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300"
          >
            Submit Task
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-xl font-bold">Submitted Tasks</h3>
          <ul className="mt-4 space-y-2">
            {submittedTasks.map((task: any, index: number) => (
              <li key={index} className="p-4 bg-gray-200 rounded-md dark:bg-gray-800">
                <p><strong>Date:</strong> {task.date}</p>
                <p><strong>Targets Given:</strong> {task.targetsGiven}</p>
                <p><strong>Targets Achieved:</strong> {task.targetsAchieved}</p>
                <p><strong>Status:</strong> {task.status}</p>
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

export default TaskSubmissionPage;