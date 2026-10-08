export type TaskPriority = 1 | 2 | 3 | 4;
export type TaskStatus = 1 | 2 | 3 | 4;

export interface Task {
  id: number;
  title: string;
  description: string | null;
  projectId: number;
  projectName: string;
  assigneeId: number;
  assigneeName: string;
  stageId: number;
  stageName: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  projectId: number;
  stageId?: number;
  assigneeId: number;
  priority: TaskPriority;
}

export interface TaskUpdateData {
  title: string;
  description: string;
  stageId: number;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface TaskResponse {
  message: string;
  task: Task;
}

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Critical" },
];
