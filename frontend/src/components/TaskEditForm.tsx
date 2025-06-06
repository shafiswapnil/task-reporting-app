import { Task, UpdateTask, TaskStatus } from '@/types/task';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface TaskEditFormProps {
  task: Task;
  onSubmit: (updatedData: UpdateTask) => Promise<void>;
  onCancel: () => void;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({ task, onSubmit, onCancel }) => {
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    project: task.project,
    targetsGiven: task.targetsGiven,
    targetsAchieved: task.targetsAchieved,
    status: task.status,
    date: new Date(task.date).toISOString().split('T')[0],
    role: task.role || '',
    team: task.team || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        developerEmail: session?.user?.email || ''
      };
      await onSubmit(updatedData);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Project</label>
        <input
          type="text"
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Targets Given</label>
        <textarea
          value={formData.targetsGiven}
          onChange={(e) => setFormData({ ...formData, targetsGiven: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Targets Achieved</label>
        <textarea
          value={formData.targetsAchieved}
          onChange={(e) => setFormData({ ...formData, targetsAchieved: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        >
          {Object.values(TaskStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default TaskEditForm;
