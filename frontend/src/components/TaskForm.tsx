"use client";

import { useState } from 'react';
import { Task, NewTask, TaskStatus } from '@/types/task';

interface TaskFormProps {
  onSubmit: (task: NewTask) => Promise<void>;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<NewTask>({
    date: '',
    project: '',
    targetsGiven: '',
    targetsAchieved: '',
    status: TaskStatus.Pending
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({
        date: '',
        project: '',
        targetsGiven: '',
        targetsAchieved: '',
        status: TaskStatus.Pending
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Project</label>
        <input
          type="text"
          value={formData.project}
          onChange={(e) => setFormData({...formData, project: e.target.value})}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Targets Given</label>
        <textarea
          value={formData.targetsGiven}
          onChange={(e) => setFormData({...formData, targetsGiven: e.target.value})}
          required
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>
      <div>
        <label className="block mb-1">Targets Achieved</label>
        <textarea
          value={formData.targetsAchieved}
          onChange={(e) => setFormData({...formData, targetsAchieved: e.target.value})}
          required
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>
      <div>
        <label className="block mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value as TaskStatus})}
          required
          className="w-full p-2 border rounded"
        >
          {Object.values(TaskStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        Submit Task
      </button>
    </form>
  );
};

export default TaskForm;
