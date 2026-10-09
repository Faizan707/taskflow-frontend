export interface NotificationItem {
  id: number;
  message: string;
  actorName: string;
  taskTitle: string | null;
  taskId: number | null;
  projectId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
