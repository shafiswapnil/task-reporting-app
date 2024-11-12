"use client";

import { Task, UpdateTask } from '@/types/task';
import { useState } from 'react';
import TaskEditForm from './TaskEditForm';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: number, taskData: UpdateTask) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTask, onDeleteTask }) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleEditSubmit = async (taskId: number, updatedData: UpdateTask) => {
    try {
      await onUpdateTask(taskId, updatedData);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDeleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="border p-4 rounded-lg shadow-sm">
          {editingTask?.id === task.id ? (
            <TaskEditForm
              task={task}
              onSubmit={(updatedData) => handleEditSubmit(task.id, updatedData)}
              onCancel={() => setEditingTask(null)}
            />
          ) : (
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
                  onClick={() => handleEdit(task)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
