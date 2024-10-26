"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const UserDashboard = () => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    targetsGiven: '',
    targetsAchieved: '',
    status: 'Completed'
  });
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/user');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', newTask);
      setNewTask({
        date: new Date().toISOString().split('T')[0],
        project: '',
        targetsGiven: '',
        targetsAchieved: '',
        status: 'Completed'
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      date: new Date(task.date).toISOString().split('T')[0],
      project: task.project,
      targetsGiven: task.targetsGiven,
      targetsAchieved: task.targetsAchieved,
      status: task.status
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/tasks/${editingTask.id}`, newTask);
      setEditingTask(null);
      setNewTask({
        date: new Date().toISOString().split('T')[0],
        project: '',
        targetsGiven: '',
        targetsAchieved: '',
        status: 'Completed'
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          {editingTask ? 'Edit Task' : 'Submit New Task'}
        </h2>
        <form onSubmit={editingTask ? handleUpdateTask : handleSubmitTask} className="space-y-2">
          <input
            type="date"
            name="date"
            value={newTask.date}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="project"
            value={newTask.project}
            onChange={handleInputChange}
            placeholder="Project"
            className="border p-2 rounded w-full"
            required
          />
          <textarea
            name="targetsGiven"
            value={newTask.targetsGiven}
            onChange={handleInputChange}
            placeholder="Targets Given"
            className="border p-2 rounded w-full"
            required
          />
          <textarea
            name="targetsAchieved"
            value={newTask.targetsAchieved}
            onChange={handleInputChange}
            placeholder="Targets Achieved"
            className="border p-2 rounded w-full"
            required
          />
          <select
            name="status"
            value={newTask.status}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          >
            <option value="Completed">Completed</option>
            <option value="Unfinished">Unfinished</option>
            <option value="Pending">Pending</option>
            <option value="Dependent">Dependent</option>
            <option value="Partially Completed">Partially Completed</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingTask ? 'Update Task' : 'Submit Task'}
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Your Tasks</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Project</th>
              <th className="border p-2">Targets Given</th>
              <th className="border p-2">Targets Achieved</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="border p-2">{new Date(task.date).toLocaleDateString()}</td>
                <td className="border p-2">{task.project}</td>
                <td className="border p-2">{task.targetsGiven}</td>
                <td className="border p-2">{task.targetsAchieved}</td>
                <td className="border p-2">{task.status}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
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
