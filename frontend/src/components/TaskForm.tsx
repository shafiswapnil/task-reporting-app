import { useState, useEffect } from 'react';
import { Task, UpdateTask, TaskStatus } from '../types/task';
import { createTask, updateTask } from '../services/api';

interface TaskFormProps {
  task?: Task;
  onSubmit: () => void;
  onCancel: () => void;
}

const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    developerId: task?.developerId || 0,
    date: task?.date?.split('T')[0] || '',
    project: task?.project || '',
    role: task?.role || '',
    team: task?.team || '',
    targetsGiven: task?.targetsGiven || '',
    targetsAchieved: task?.targetsAchieved || '',
    status: task?.status || 'Pending' as TaskStatus
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (task?.id) {
        // Update existing task
        await updateTask(task.id, {
          id: task.id,
          ...formData
        });
      } else {
        // Create new task
        await createTask(formData);
      }
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Developer</label>
        <select
          value={formData.developerId}
          onChange={(e) => setFormData({ ...formData, developerId: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select Developer</option>
          {/* Add developer options here */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Project</label>
        <input
          type="text"
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          placeholder="e.g., AFS, SB, VideoEnc"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <input
          type="text"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          placeholder="e.g., Developer, Tester"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Team</label>
        <select
          value={formData.team}
          onChange={(e) => setFormData({ ...formData, team: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="web">Web Team</option>
          <option value="app">App Team</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Targets Given</label>
        <input
          type="text"
          value={formData.targetsGiven}
          onChange={(e) => setFormData({ ...formData, targetsGiven: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          placeholder="Enter targets given"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Targets Achieved</label>
        <input
          type="text"
          value={formData.targetsAchieved}
          onChange={(e) => setFormData({ ...formData, targetsAchieved: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          placeholder="Enter targets achieved"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="Completed">Completed</option>
          <option value="Unfinished">Unfinished</option>
          <option value="Pending">Pending</option>
          <option value="Dependent">Dependent</option>
          <option value="PartiallyCompleted">Partially Completed</option>
        </select>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (task ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
