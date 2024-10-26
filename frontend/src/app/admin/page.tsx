"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SessionProvider, useSession, signIn } from 'next-auth/react';
import {
  ChartBarIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const AdminDashboardPage = () => {
  const { data: session, status } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('addAdmin');
  const [filterDate, setFilterDate] = useState('');

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

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold">You must be signed in to access this page.</h2>
        <button onClick={() => signIn()} className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">
          Sign In
        </button>
      </div>
    );
  }

  const [newDeveloper, setNewDeveloper] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Full Time',
    team: 'Web Dev',
    projects: [],
    joiningDate: '',
    weekdays: '',
  });
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [developers, setDevelopers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDevelopers();
    fetchTasks();
  }, []);

  const handleAddDeveloper = async () => {
    try {
      await axios.post('/api/developers', newDeveloper);
      setMessage('Developer added successfully!');
      setNewDeveloper({ name: '', email: '', phone: '', role: 'Full Time', team: 'Web Dev', projects: [], joiningDate: '', weekdays: '' });
      fetchDevelopers();
    } catch (error) {
      setMessage('Failed to add developer. Please try again.');
    }
  };

  const handleAddAdmin = async () => {
    try {
      await axios.post('/api/admins', newAdmin);
      setMessage('Admin added successfully!');
      setNewAdmin({ name: '', email: '', phone: '', password: '' });
    } catch (error) {
      setMessage('Failed to add admin. Please try again.');
    }
  };

  const fetchDevelopers = async () => {
    try {
      const response = await axios.get('/api/developers');
      setDevelopers(response.data);
    } catch (error) {
      console.error('Failed to fetch developers:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleEditTask = (task: any) => {
    setEditTaskId(task.id);
    setNewTask({
      developerName: task.developerName,
      date: task.date,
      project: task.project,
      role: task.role,
      team: task.team,
      targetsGiven: task.targetsGiven,
      targetsAchieved: task.targetsAchieved,
      status: task.status,
    });
  };

  const generatePDF = (filter: string, project: string | null = null) => {
    const doc = new jsPDF();
    let filteredTasks = tasks;
    const title = `Tasks Report - ${filter}${project ? ` - Project: ${project}` : ''}`;

    if (filter === 'Daily') {
      const today = new Date().toISOString().split('T')[0];
      filteredTasks = tasks.filter((task: any) => task.date === today);
    } else if (filter === 'Weekly') {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      filteredTasks = tasks.filter((task: any) => {
        const taskDate = new Date(task.date);
        return taskDate >= weekAgo && taskDate <= today;
      });
    } else if (filter === 'Monthly') {
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      filteredTasks = tasks.filter((task: any) => {
        const taskDate = new Date(task.date);
        return taskDate >= monthAgo && taskDate <= today;
      });
    }

    if (project) {
      filteredTasks = filteredTasks.filter((task: any) => task.project === project);
    }

    doc.text(title, 20, 10);
    doc.autoTable({
      head: [['Developer', 'Date', 'Project', 'Targets Given', 'Targets Achieved', 'Status']],
      body: filteredTasks.map((task: any) => [
        task.developerName,
        task.date,
        task.project,
        task.targetsGiven,
        task.targetsAchieved,
        task.status,
      ]),
    });
    doc.save(`${title}.pdf`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'addAdmin':
        return (
          <div>
            <h3 className="text-2xl font-bold">Add Admin</h3>
            <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddAdmin(); }}>
              <div>
                <label htmlFor="adminName" className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="adminPhone" className="block text-sm font-medium">Phone</label>
                <input
                  type="text"
                  id="adminPhone"
                  name="adminPhone"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  id="adminPassword"
                  name="adminPassword"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
              >
                Add Admin
              </button>
            </form>
          </div>
        );
      case 'addDeveloper':
        return (
          <div>
            <h3 className="text-2xl font-bold">Add Developer</h3>
            <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddDeveloper(); }}>
              <div>
                <label htmlFor="developerName" className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  id="developerName"
                  name="developerName"
                  value={newDeveloper.name}
                  onChange={(e) => setNewDeveloper({ ...newDeveloper, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="developerEmail" className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  id="developerEmail"
                  name="developerEmail"
                  value={newDeveloper.email}
                  onChange={(e) => setNewDeveloper({ ...newDeveloper, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="developerPhone" className="block text-sm font-medium">Phone</label>
                <input
                  type="text"
                  id="developerPhone"
                  name="developerPhone"
                  value={newDeveloper.phone}
                  onChange={(e) => setNewDeveloper({ ...newDeveloper, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="developerRole" className="block text-sm font-medium">Role</label>
                <select
                  id="developerRole"
                  name="developerRole"
                  value={newDeveloper.role}
                  onChange={(e) => setNewDeveloper({ ...newDeveloper, role: e.target.value })}
                  className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
              >
                Add Developer
              </button>
            </form>
          </div>
        );
      case 'developersList':
        return (
          <div>
            <h3 className="text-2xl font-bold">Developers</h3>
            <ul className="mt-4 space-y-2">
              {developers.map((developer: any) => (
                <li key={developer.id} className="p-4 bg-gray-200 dark:bg-gray-800 rounded-md">
                  <p><strong>Name:</strong> {developer.name}</p>
                  <p><strong>Email:</strong> {developer.email}</p>
                  <p><strong>Phone:</strong> {developer.phone}</p>
                  <p><strong>Role:</strong> {developer.role}</p>
                  <p><strong>Team:</strong> {developer.team}</p>
                  <p><strong>Projects:</strong> {developer.projects.join(', ')}</p>
                  <p><strong>Joining Date:</strong> {developer.joiningDate}</p>
                  <p><strong>Weekdays:</strong> {developer.weekdays}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'tasksList':
        return (
          <div>
            <h3 className="text-2xl font-bold">Tasks</h3>
            <div className="mt-4 mb-6">
              <label htmlFor="filterDate" className="block text-sm font-medium">Filter by Date</label>
              <input
                type="date"
                id="filterDate"
                name="filterDate"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <ul className="mt-4 space-y-2">
              {tasks
                .filter((task: any) => !filterDate || task.date === filterDate)
                .map((task: any) => (
                  <li key={task.id} className="p-4 bg-gray-200 dark:bg-gray-800 rounded-md">
                    <p><strong>Developer:</strong> {task.developerName}</p>
                    <p><strong>Date:</strong> {task.date}</p>
                    <p><strong>Project:</strong> {task.project}</p>
                    <p><strong>Role:</strong> {task.role}</p>
                    <p><strong>Team:</strong> {task.team}</p>
                    <p><strong>Targets Given:</strong> {task.targetsGiven}</p>
                    <p><strong>Targets Achieved:</strong> {task.targetsAchieved}</p>
                    <p><strong>Status:</strong> {task.status}</p>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="mt-2 px-4 py-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring focus:ring-yellow-300"
                    >
                      Edit Task
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        );
      case 'export':
        return (
          <div>
            <h3 className="text-2xl font-bold">Export Reports</h3>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => generatePDF('Daily')}
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring focus:ring-purple-300"
              >
                Export Daily Report
              </button>
              <button
                onClick={() => generatePDF('Weekly')}
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring focus:ring-purple-300"
              >
                Export Weekly Report
              </button>
              <button
                onClick={() => generatePDF('Monthly')}
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring focus:ring-purple-300"
              >
                Export Monthly Report
              </button>
              <select
                onChange={(e) => generatePDF('Project', e.target.value)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring focus:ring-purple-300"
              >
                <option value="">Select Project Report</option>
                {Array.from(new Set(tasks.map((task: any) => task.project))).map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="w-1/4 h-screen bg-gray-200 dark:bg-gray-900 p-4">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <button onClick={() => setActiveTab('addAdmin')} className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center space-x-2">
              <UserPlusIcon className="w-5 h-5" />
              <span>Add Admin</span>
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('addDeveloper')} className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center space-x-2">
              <UserPlusIcon className="w-5 h-5" />
              <span>Add Developer</span>
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('developersList')} className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center space-x-2">
              <UsersIcon className="w-5 h-5" />
              <span>Developers List</span>
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('tasksList')} className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center space-x-2">
              <ClipboardDocumentListIcon className="w-5 h-5" />
              <span>Tasks List</span>
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('export')} className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Export Reports</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="w-3/4 p-8 space-y-6 bg-white dark:bg-gray-900 rounded-md shadow-md">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold text-center">Admin Dashboard</h2>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300"
          >
            Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
          </button>
        </div>
        {message && <p className="text-center text-green-500">{message}</p>}
        {renderContent()}
      </div>
    </div>
  );
};

const AuthenticatedAdminDashboardPage = () => (
  <SessionProvider>
    <AdminDashboardPage />
  </SessionProvider>
);

export default AuthenticatedAdminDashboardPage;
