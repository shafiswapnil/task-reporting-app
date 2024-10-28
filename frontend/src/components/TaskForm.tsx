import { useState, useEffect } from 'react';
import { Task, TaskStatus, NewTask } from '@/types/task';

interface TaskFormProps {
  onSubmit: (task: NewTask) => void;
  initialData?: Task;
  submitLabel: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, submitLabel }) => {
  const [formData, setFormData] = useState<NewTask>({
    developerId: initialData?.developerId || 0,
    date: initialData?.date || '',
    project: initialData?.project || '',
    role: initialData?.role || '',
    team: initialData?.team || 'web',
    targetsGiven: initialData?.targetsGiven || '',
    targetsAchieved: initialData?.targetsAchieved || '',
    status: initialData?.status || 'Pending',
  });

  const [developers, setDevelopers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await fetch('/api/developers');
        if (!response.ok) {
          throw new Error('Failed to fetch developers');
        }
        const data = await response.json();
        setDevelopers(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load developers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'developerId' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) {
    return <div>Loading form...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="developerId" className="block text-sm font-medium">
          Developer
        </label>
        <select
          id="developerId"
          name="developerId"
          value={formData.developerId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        >
          <option value="">Select Developer</option>
          {developers.map(dev => (
            <option key={dev.id} value={dev.id}>
              {dev.name} ({dev.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <div>
        <label htmlFor="project" className="block text-sm font-medium">
          Project
        </label>
        <input
          type="text"
          id="project"
          name="project"
          value={formData.project}
          onChange={handleChange}
          required
          placeholder="e.g., AFS, SB, VideoEnc"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Role
        </label>
        <input
          type="text"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          placeholder="e.g., Developer, Tester"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <div>
        <label htmlFor="team" className="block text-sm font-medium">
          Team
        </label>
        <select
          id="team"
          name="team"
          value={formData.team}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        >
          <option value="web">Web Team</option>
          <option value="app">App Team</option>
        </select>
      </div>

      <div>
        <label htmlFor="targetsGiven" className="block text-sm font-medium">
          Targets Given
        </label>
        <input
          type="text"
          id="targetsGiven"
          name="targetsGiven"
          value={formData.targetsGiven}
          onChange={handleChange}
          required
          placeholder="Enter targets given"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <div>
        <label htmlFor="targetsAchieved" className="block text-sm font-medium">
          Targets Achieved
        </label>
        <input
          type="text"
          id="targetsAchieved"
          name="targetsAchieved"
          value={formData.targetsAchieved}
          onChange={handleChange}
          required
          placeholder="Enter targets achieved"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        >
          <option value="Completed">Completed</option>
          <option value="Unfinished">Unfinished</option>
          <option value="Pending">Pending</option>
          <option value="Dependent">Dependent</option>
          <option value="PartiallyCompleted">Partially Completed</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default TaskForm;

