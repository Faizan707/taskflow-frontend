import type { Task } from "./task";

export interface KanbanStage {
  id: number;
  name: string;
  order: number;
  isDefault: boolean;
  projectId: number;
  tasks: Task[];
}

export interface KanbanStageFormData {
  name: string;
  projectId: number;
}

export interface KanbanStageResponse {
  message: string;
  stage: KanbanStage;
}
