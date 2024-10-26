"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const AdminDashboard = () => {
  const { data: session } = useSession();
  const [developers, setDevelopers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newDeveloper, setNewDeveloper] = useState({
    name: '', email: '', phoneNumber: '', fullTime: true,
    team: 'web', projects: [], workingDays: [], password: ''
  });
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [project, setProject] = useState('');

  useEffect(() => {
    if (session) {
      fetchDevelopers();
      fetchTasks();
    }
  }, [session]);

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

  const handleAddDeveloper = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/developers', newDeveloper);
      setNewDeveloper({
        name: '', email: '', phoneNumber: '', fullTime: true,
        team: 'web', projects: [], workingDays: [], password: ''
      });
      fetchDevelopers();
    } catch (error) {
      console.error('Failed to add developer:', error);
    }
  };

  const generateReport = async () => {
    try {
      const response = await axios.get(`/api/reports/${reportType}`, {
        params: { startDate, endDate, project }
      });
      
      const tasks = response.data;

      const doc = new jsPDF();
      doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 10, 10);
      
      const tableColumn = ["Developer", "Date", "Project", "Targets Given", "Targets Achieved", "Status"];
      const tableRows = tasks.map(task => [
        task.developer.name,
        new Date(task.date).toLocaleDateString(),
        task.project,
        task.targetsGiven,
        task.targetsAchieved,
        task.status
      ]);

      doc.autoTable(tableColumn, tableRows, { startY: 20 });
      doc.save(`${reportType}_report.pdf`);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Developer</h2>
        <form onSubmit={handleAddDeveloper} className="space-y-2">
          {/* Add form inputs for all developer fields */}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Developer</button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Developers</h2>
        {/* Add a table or list to display developers */}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tasks</h2>
        {/* Add a table or list to display tasks */}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Generate Report</h2>
        <div className="space-y-2">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input 
            type="text" 
            value={project} 
            onChange={(e) => setProject(e.target.value)}
            placeholder="Project (optional)"
            className="border p-2 rounded"
          />
          <button 
            onClick={generateReport} 
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
