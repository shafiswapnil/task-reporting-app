export enum TaskStatus {
    Completed = 'Completed',
    Pending = 'Pending',
    PartiallyCompleted = 'Partially Completed',
    Unfinished = 'Unfinished',
    Dependent = 'Dependent'
}

export interface Task {
    id: number;
    date: string;
    project: string;
    targetsGiven: string;
    targetsAchieved: string;
    status: TaskStatus;
    developerId: number;
    submittedAt: string;
}

export interface NewTask {
    date: string;
    project: string;
    targetsGiven: string;
    targetsAchieved: string;
    status: TaskStatus;
}

export interface UpdateTask {
    date?: string;
    project?: string;
    targetsGiven?: string;
    targetsAchieved?: string;
    status?: TaskStatus;
}
