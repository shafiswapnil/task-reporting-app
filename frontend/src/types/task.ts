export enum TaskStatus {
  Completed = 'Completed',
  Unfinished = 'Unfinished',
  Pending = 'Pending',
  Dependent = 'Dependent',
  PartiallyCompleted = 'PartiallyCompleted'
}

export interface Task {
  id: number;
  developerId: number;
  date: string;
  project: string;
  role: string;
  team: string;
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
  date: string;
  project: string;
  targetsGiven: string;
  targetsAchieved: string;
  status: TaskStatus;
  developerEmail?: string;
}

export interface TaskSubmissionStatus {
  date: string;
  submitted: boolean;
}

// Add UpdateTask type
export interface UpdateTask {
  targetsAchieved?: string;
  status?: TaskStatus;
}
