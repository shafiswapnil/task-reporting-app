"use client";

import withAuth from '@/components/withAuth';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const AdminDashboard = () => {
  const [developers, setDevelopers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const { data: session } = useSession();
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [project, setProject] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [developersResponse, tasksResponse] = await Promise.all([
          fetch('/api/developers'),
          fetch('/api/tasks')
        ]);

        if (!developersResponse.ok || !tasksResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const developersData = await developersResponse.json();
        const tasksData = await tasksResponse.json();

        setDevelopers(developersData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const generateReport = async () => {
    try {
      // Construct the query string
      const queryParams = new URLSearchParams({
        type: reportType,
        startDate,
        endDate,
        project,
      }).toString();

      const response = await fetch(`/api/reports?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      const data = await response.json();

      // Generate PDF using jsPDF
      const doc = new jsPDF();
      doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 14, 15);
      doc.text(`Project: ${project || 'All'}`, 14, 25);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 35);

      // Add table to PDF
      doc.autoTable({
        head: [['Date', 'Developer', 'Project', 'Targets Given', 'Targets Achieved', 'Status']],
        body: data.map((task: any) => [
          task.date,
          task.developer.name,
          task.project,
          task.targetsGiven,
          task.targetsAchieved,
          task.status,
        ]),
        startY: 45,
      });

      // Save the PDF
      doc.save(`${reportType}_report_${startDate}_to_${endDate}.pdf`);

      // Optionally, you can set a success message in the state
      // setMessage('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      // Optionally, you can set an error message in the state
      // setError('Failed to generate report. Please try again.');
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

export default withAuth(AdminDashboard, ['admin']);
