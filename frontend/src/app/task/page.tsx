"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const TaskSubmissionPage = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';
  const [taskData, setTaskData] = useState({
    date: '',
    targetsGiven: '',
    targetsAchieved: '',
    status: 'Pending',
  });
  const [message, setMessage] = useState('');
  const [submittedTasks, setSubmittedTasks] = useState([]);

  useEffect(() => {
    if (session && session.user && session.user.email) {
      fetchSubmittedTasks();
    }
  }, [session]);

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-center">Submit Your Task</h2>
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
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
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
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
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
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
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
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
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
              <li key={index} className="p-4 bg-gray-200 rounded-md">
                <p><strong>Date:</strong> {task.date}</p>
                <p><strong>Targets Given:</strong> {task.targetsGiven}</p>
                <p><strong>Targets Achieved:</strong> {task.targetsAchieved}</p>
                <p><strong>Status:</strong> {task.status}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TaskSubmissionPage;
