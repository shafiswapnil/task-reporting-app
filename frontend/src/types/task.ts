export type TaskStatus = 
  | 'Completed'
  | 'Unfinished'
  | 'Pending'
  | 'Dependent'
  | 'PartiallyCompleted';

export interface Task {
  id?: number;
  date: string;
  project: string;
  targetsGiven: string;
  targetsAchieved: string;
  status: TaskStatus;
  submittedAt: string;
  developer?: {
    name: string;
    email: string;
  };
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
  isSubmitted: boolean;
  taskId?: number;
  submittedAt?: string | null;
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
