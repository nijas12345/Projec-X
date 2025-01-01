import { Request, Response } from "express";
import HTTP_statusCode from "../Enums/httpStatusCode";
import { INotificationService } from "../Interfaces/notification.service.interface";
import { HttpStatusCode } from "axios";

class NotificationController {
  private notificationService: INotificationService;
  constructor(notificationService: INotificationService) {
    this.notificationService = notificationService;
  }
  getNotifications = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceRespone = await this.notificationService.getNotifications(
        user_id
      );
      res.status(HttpStatusCode.Ok).json(serviceRespone);
    } catch (error) {
      throw error;
    }
  };
  getAdminNotifications = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const serviceRespone =
        await this.notificationService.getAdminNotifications(admin_id);
      res.status(HttpStatusCode.Ok).json(serviceRespone);
    } catch (error) {
      throw error;
    }
  };
  getNotificationsCount = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceRespone =
        await this.notificationService.getNotificationsCount(user_id);
      res.status(HttpStatusCode.Ok).json(serviceRespone);
    } catch (error) {
      throw error;
    }
  };
  adminNotificationsCount = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const serviceRespone =
        await this.notificationService.adminNotificationsCount(admin_id);
      res.status(HttpStatusCode.Ok).json(serviceRespone);
    } catch (error) {
      throw error;
    }
  };
}

export default NotificationController;
