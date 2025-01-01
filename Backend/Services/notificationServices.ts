import { INotificationRepository } from "../Interfaces/notification.repository.interface";
import { INotification } from "../Interfaces/commonInterface";
import { INotificationService } from "../Interfaces/notification.service.interface";

class NotificationService implements INotificationService {
  private notificationRepository: INotificationRepository;
  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  saveNotification = async (
    notificationDetails: INotification
  ): Promise<{ message: string; assignedUserId: string }> => {
    try {
      const notificationData =
        await this.notificationRepository.saveNotification(notificationDetails);
      return notificationData;
    } catch (error) {
      throw error;
    }
  };
  userSaveNotification = async (
    notificationDetails: INotification
  ): Promise<{ message: string; admin_id: string }> => {
    try {
      const notificationData =
        await this.notificationRepository.userSaveNotification(
          notificationDetails
        );
      return notificationData;
    } catch (error) {
      throw error;
    }
  };
  getNotifications = async (user_id: string): Promise<INotification[]> => {
    try {
      const notificationData: INotification[] =
        await this.notificationRepository.getNotifications(user_id);
      if (!notificationData) {
        throw new Error("No notifications are availabe");
      }
      return notificationData;
    } catch (error) {
      throw error;
    }
  };
  getAdminNotifications = async (
    admin_id: string
  ): Promise<INotification[]> => {
    try {
      const notificationData: INotification[] =
        await this.notificationRepository.getAdminNotifications(admin_id);
      if (!notificationData) {
        throw new Error("No notifications are availabe");
      }
      return notificationData;
    } catch (error) {
      throw error;
    }
  };
  getNotificationsCount = async (user_id: string): Promise<INotification[]> => {
    try {
      const notificationData: INotification[] =
        await this.notificationRepository.getNotificationsCount(user_id);
      if (!notificationData) {
        throw new Error("No notifications are availabe");
      }
      return notificationData;
    } catch (error) {
      throw error;
    }
  };
  adminNotificationsCount = async (
    admin_id: string
  ): Promise<INotification[]> => {
    try {
      const notificationData: INotification[] =
        await this.notificationRepository.adminNotificationsCount(admin_id);
      if (!notificationData) {
        throw new Error("No notifications are availabe");
      }
      return notificationData;
    } catch (error) {
      throw error;
    }
  };
}

export default NotificationService;
