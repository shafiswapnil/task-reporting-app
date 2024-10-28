// Add this to your existing api.ts file
export const updateTask = async (taskId: number, taskData: UpdateTask): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/admin/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}` // Ensure you have a getToken function
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update task');
  }

  return response.json();
};

