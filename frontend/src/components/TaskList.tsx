"use client";

import { Task } from '@/types/task';
import { TaskStatus } from '@/types/taskStatus';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: number, taskData: UpdateTask) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTask, onDeleteTask }) => {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="border p-4 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">{task.project}</p>
              <p>Date: {new Date(task.date).toLocaleDateString()}</p>
              <p>Team: {task.team}</p>
              <p>Role: {task.role}</p>
              <p>Targets Given: {task.targetsGiven}</p>
              <p>Targets Achieved: {task.targetsAchieved}</p>
              <p>Status: {task.status}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => onUpdateTask(task.id, {
                  status: task.status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed
                })}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Toggle Status
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
