export interface Project {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
}

export interface ProjectResponse {
  message: string;
  project: Project;
}
