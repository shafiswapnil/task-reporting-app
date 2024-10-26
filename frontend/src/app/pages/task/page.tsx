"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const TaskSubmissionPage = () => {
  const { data: session } = useSession();
  const [taskData, setTaskData] = useState({
    project: '',
    target: '',
    status: 'Pending',
    date: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!session || !session.user || !session.user.email) {
      setMessage('You need to be logged in to submit a task.');
      return;
    }

    try {
      const response = await axios.post('/api/tasks', {
        developerEmail: session.user.email,
        ...taskData,
      });
      setMessage('Task submitted successfully!');
      setTaskData({ project: '', target: '', status: 'Pending', date: '' });
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
            <label htmlFor="project" className="block text-sm font-medium">
              Project
            </label>
            <input
              type="text"
              id="project"
              name="project"
              value={taskData.project}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="target" className="block text-sm font-medium">
              Target
            </label>
            <input
              type="text"
              id="target"
              name="target"
              value={taskData.target}
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
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300"
          >
            Submit Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskSubmissionPage;
