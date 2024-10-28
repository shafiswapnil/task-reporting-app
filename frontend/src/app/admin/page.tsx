"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import MissingReportsCalendar from '@/components/MissingReportsCalendar';
import withAuth from '@/components/withAuth';

const AdminDashboard = () => {
  const { data: session } = useSession();
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [project, setProject] = useState('');
  const [refreshTasks, setRefreshTasks] = useState(false); // Trigger to refresh tasks list

  useEffect(() => {
    // Optionally, fetch initial data or perform other side effects
  }, [session]);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    try {
      // Construct the query string
      const queryParams = new URLSearchParams({
        type: reportType,
        startDate,
        endDate,
        project,
      }).toString();

      const response = await fetch(`/api/reports?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Adjust as per your auth implementation
        },
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to generate report');
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
          task.status.replace(/([A-Z])/g, ' $1').trim(),
        ]),
        startY: 45,
      });

      // Save the PDF
      doc.save(`${reportType}_report_${startDate}_to_${endDate}.pdf`);

      alert('Report generated successfully');
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(error.message || 'Failed to generate report. Please try again.');
    }
  };

  const handleAddTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Adjust as per your auth implementation
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

      {/* Generate Report Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Generate Reports</h2>
        <div className="space-y-4">
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
            placeholder="Start Date"
          />
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
            placeholder="End Date"
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
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Generate Report
          </button>
        </div>
      </section>

      {/* Missing Reports Calendar - Optional */}
      <MissingReportsCalendar 
        weekdays={[]} // Ensure to pass the correct weekdays if needed
        onDateSelect={() => { /* Implement if needed */ }}
      />
    </div>
  );
};

export default withAuth(AdminDashboard, { allowedRoles: ['admin'] });
