export type UserRole = "User" | "Manager" | "Admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UpdateRoleResponse {
  message: string;
  user: User;
}
