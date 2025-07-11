export enum NotificationType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title?: string;
  message?: string;
  sentAt: string;
  isRead: boolean;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title?: string;
  message?: string;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
}

export interface NotificationWithUser extends Notification {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
} 