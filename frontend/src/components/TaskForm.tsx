"use client";

import { useState } from 'react';
import { Task } from '@/types/task';
import { NewTask } from '@/types/task';

interface TaskFormProps {
  onSubmit: (task: NewTask) => Promise<void>;
  initialData?: Partial<Task>;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<NewTask>({
    date: initialData?.date || '',
    project: initialData?.project || '',
    targetsGiven: initialData?.targetsGiven || '',
    targetsAchieved: initialData?.targetsAchieved || '',
    status: initialData?.status || 'Pending'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
        <input
          type="text"
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Targets Given</label>
        <textarea
          value={formData.targetsGiven}
          onChange={(e) => setFormData({ ...formData, targetsGiven: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Targets Achieved</label>
        <textarea
          value={formData.targetsAchieved}
          onChange={(e) => setFormData({ ...formData, targetsAchieved: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="PartiallyCompleted">Partially Completed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <button
        type="submit"
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        Submit Task
      </button>
    </form>
  );
};

export default TaskForm;
