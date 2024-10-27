"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const { data: session } = useSession();
  const [newTask, setNewTask] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    targetsGiven: '',
    targetsAchieved: '',
    status: 'Completed'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

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
        date: new Date().toISOString().split('T')[0],
        project: '',
        targetsGiven: '',
        targetsAchieved: '',
        status: 'Completed'
      });
      await fetchTasks();
    } catch (error) {
      console.error('Error submitting task:', error);
      // You might want to set an error state here to display to the user
    }
  };

  // ... rest of the component
};

export default UserDashboard;
