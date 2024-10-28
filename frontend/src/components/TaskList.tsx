import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types/task';
import TaskForm from './TaskForm';

interface TaskListProps {
  refreshTrigger: boolean;
  setRefreshTrigger: (value: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({ refreshTrigger, setRefreshTrigger }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks/admin');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refreshTrigger]);

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/admin/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Adjust as per your auth implementation
        },
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to delete task');
      }

      alert('Task deleted successfully');
      setRefreshTrigger(!refreshTrigger);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleUpdate = async (updatedTask: any) => {
    try {
      const response = await fetch(`/api/tasks/admin/${editingTask?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to update task');
      }

      alert('Task updated successfully');
      setEditingTask(null);
      setRefreshTrigger(!refreshTrigger);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date_desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'status_asc':
        return a.status.localeCompare(b.status);
      case 'status_desc':
        return b.status.localeCompare(a.status);
      default:
        return 0;
    }
  });

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="mt-8">
      {editingTask && (
        <div className="mb-8 p-4 border rounded-md bg-gray-100 dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
          <TaskForm
            onSubmit={handleUpdate}
            initialData={editingTask}
            submitLabel="Update Task"
          />
          <button
            onClick={() => setEditingTask(null)}
            className="mt-4 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="filter" className="mr-2 font-medium">Filter by Status:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1 border rounded-md"
          >
            <option value="all">All</option>
            <option value="Completed">Completed</option>
            <option value="Unfinished">Unfinished</option>
            <option value="Pending">Pending</option>
            <option value="Dependent">Dependent</option>
            <option value="PartiallyCompleted">Partially Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="sortBy" className="mr-2 font-medium">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 border rounded-md"
          >
            <option value="date_desc">Date (Newest First)</option>
            <option value="date_asc">Date (Oldest First)</option>
            <option value="status_asc">Status (A-Z)</option>
            <option value="status_desc">Status (Z-A)</option>
          </select>
        </div>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-900 rounded-md overflow-hidden">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Date</th>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Developer</th>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Project</th>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Role</th>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Team</th>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Targets Given</th>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Targets Achieved</th>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Status</th>
            <th className="py-2 px-4 bg-gray-200 dark:bg-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map(task => (
            <tr key={task.id} className="border-b dark:border-gray-700">
              <td className="py-2 px-4">{new Date(task.date).toLocaleDateString()}</td>
              <td className="py-2 px-4">{task.developer.name} ({task.developer.email})</td>
              <td className="py-2 px-4">{task.project}</td>
              <td className="py-2 px-4">{task.role}</td>
              <td className="py-2 px-4 capitalize">{task.team}</td>
              <td className="py-2 px-4">{task.targetsGiven}</td>
              <td className="py-2 px-4">{task.targetsAchieved}</td>
              <td className="py-2 px-4">{task.status.replace(/([A-Z])/g, ' $1').trim()}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-2 py-1 mr-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-2 py-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {sortedTasks.length === 0 && (
            <tr>
              <td colSpan={9} className="py-4 text-center text-gray-500">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;

