"use client";

import { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export default function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(task.date).toLocaleDateString()}</td>
              <td className="px-6 py-4">{task.project}</td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    task.status === 'PartiallyCompleted' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-900 mr-4"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
