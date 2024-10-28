export type TaskStatus = 'Pending' | 'Completed' | 'PartiallyCompleted' | 'Failed';

export interface Task {
  id: string;
  date: string;
  project: string;
  targetsGiven: string;
  targetsAchieved: string;
  status: TaskStatus;
  developerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewTask {
  developerId: number;
  date: string;
  project: string;
  role: string;
  team: string;
  targetsGiven: string;
  targetsAchieved: string;
  status: TaskStatus;
}

export interface TaskSubmissionStatus {
  date: string;
  submitted: boolean;
}

// Add UpdateTask type
export interface UpdateTask {
  id: number;
  developerId: number;
  date: string;
  project: string;
  role: string;
  team: string;
  targetsGiven: string;
  targetsAchieved: string;
  status: TaskStatus;
}
