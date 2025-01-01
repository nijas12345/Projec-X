import { INotification  } from "./commonInterface";

export interface INotificationRepository{
  saveNotification(notificationDetails:INotification):Promise<{message:string,assignedUserId:string}>
  userSaveNotification(notificationDetails:INotification):Promise<{message:string,admin_id:string}>
  getNotifications(user_id:string):Promise<INotification[]>
  getAdminNotifications(admin_id:string):Promise<INotification[]>
  getNotificationsCount(user_id:string):Promise<INotification[]>
  adminNotificationsCount(admin_id:string):Promise<INotification[]>  
}