export type TaskStatus = 
  | 'Completed'
  | 'Unfinished'
  | 'Pending'
  | 'Dependent'
  | 'Partially Completed';

export interface Task {
  id: number;
  date: string;
  project: string;
  targetsGiven: string;
  targetsAchieved: string;
  status: TaskStatus;
  developerId: number;
  team: string;
  role: string;
  submittedAt: string;  // Add this
}

export interface NewTask {
  date: string;
  project: string;
  targetsGiven: string;
  targetsAchieved: string;
  status: TaskStatus;
  team: string;
  role: string;
}

export interface TaskSubmissionStatus {
  date: string;
  isSubmitted: boolean;
  taskId?: number;
}
