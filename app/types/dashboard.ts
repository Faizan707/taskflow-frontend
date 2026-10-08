import type { Task } from "./task";

export interface DashboardSummary {
  totalProjects: number;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  blockedCount: number;
  lowPriorityCount: number;
  mediumPriorityCount: number;
  highPriorityCount: number;
  criticalPriorityCount: number;
  totalUsers: number | null;
  recentTasks: Task[];
}
