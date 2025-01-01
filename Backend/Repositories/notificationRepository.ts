import mongoose, { Model } from "mongoose";
import { INotificationRepository } from "../Interfaces/notification.repository.interface";
import {
  IUser,
  INotification,
  ITask,
  IAdmin,
} from "../Interfaces/commonInterface";
import Project from "../Model/projectModal";

class NotificationRepository implements INotificationRepository {
  private adminModel = Model<IAdmin>;
  private userModel = Model<IUser>;
  private taskModel = Model<ITask>;
  private notificationModel = Model<INotification>;
  constructor(
    adminModel: Model<IAdmin>,
    userModel: Model<IUser>,
    taskModel: Model<ITask>,
    notificationModel: Model<INotification>
  ) {
    this.adminModel = adminModel;
    this.userModel = userModel;
    this.taskModel = taskModel;
    this.notificationModel = notificationModel;
  }
  saveNotification = async (
    notificationDetails: INotification
  ): Promise<{ message: string; assignedUserId: string }> => {
    try {
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: notificationDetails.admin_id,
      });
      console.log(adminData);

      if (!adminData) throw new Error("NO user data found");
      const adminID = adminData.admin_id;
      const adminEmail = adminData.email;
      const taskData: ITask | null = await this.taskModel.findOne({
        _id: notificationDetails.taskId,
      });
      console.log(taskData);

      if (!taskData) {
        throw new Error("No task Data");
      }
      const taskId = taskData._id;
      const taskMember = taskData.member;
      const taskMessage = taskData.taskName;
      const assignedUserData: IUser | null = await this.userModel.findOne({
        email: taskMember,
      });
      if (!assignedUserData) {
        throw new Error("No assigned members");
      }
      const assignedUserId = assignedUserData.user_id;
      const message = `A new task ${taskMessage} assigned by ${adminEmail}`;
      const notification = {
        admin_id: adminID,
        taskId: taskId,
        message: message,
        assignedUserId: assignedUserId,
        notificationType: "User",
      };
      const notificationData: INotification =
        await this.notificationModel.create(notification);
      console.log("notification", notificationData);

      return { message: notificationData.message, assignedUserId };
    } catch (error) {
      throw error;
    }
  };
  userSaveNotification = async (
    notificationDetails: INotification
  ): Promise<{ message: string; admin_id: string }> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: notificationDetails.assignedUserId,
      });

      if (!userData) throw new Error("NO user data found");
      const assignedUserId = userData.user_id;
      const userEmail = userData.email;
      const taskData: ITask | null = await this.taskModel.findOne({
        _id: notificationDetails.taskId,
      });
      if (!taskData) {
        throw new Error("No task Data");
      }
      const taskId = taskData._id;
      const admin_id: string = taskData.admin_id;
      const message = notificationDetails.message;
      const notification = {
        admin_id: admin_id,
        taskId: taskId,
        message: message,
        assignedUserId: assignedUserId,
        notificationType: "Admin",
      };
      const notificationData: INotification =
        await this.notificationModel.create(notification);
      console.log("notification", notificationData);

      return { message: notificationData.message, admin_id };
    } catch (error) {
      throw error;
    }
  };
  getNotifications = async (user_id: string): Promise<INotification[]> => {
    try {
      const notificationData = await this.notificationModel.updateMany(
        { assignedUserId: user_id },
        {
          $set: { isRead: true },
        },
        { new: true }
      );

      const notification: INotification[] = await this.notificationModel
        .find({ assignedUserId: user_id, notificationType: "User" })
        .sort({ createdAt: -1 });
      return notification;
    } catch (error) {
      throw error;
    }
  };
  getAdminNotifications = async (
    admin_id: string
  ): Promise<INotification[]> => {
    try {
      const notificationData = await this.notificationModel.updateMany(
        { admin_id: admin_id, notificationType: "Admin" },
        {
          $set: { isRead: true },
        },
        { new: true }
      );

      const notification: INotification[] = await this.notificationModel
        .find({ admin_id: admin_id, notificationType: "Admin" })
        .sort({ createdAt: -1 });
      return notification;
    } catch (error) {
      throw error;
    }
  };
  getNotificationsCount = async (user_id: string): Promise<INotification[]> => {
    try {
      const notification: INotification[] = await this.notificationModel
        .find({ assignedUserId: user_id, notificationType: "User" })
        .sort({ createdAt: -1 });
      return notification;
    } catch (error) {
      throw error;
    }
  };
  adminNotificationsCount = async (
    admin_id: string
  ): Promise<INotification[]> => {
    try {
      const notification: INotification[] = await this.notificationModel
        .find({ admin_id: admin_id, notificationType: "Admin" })
        .sort({ createdAt: -1 });
      return notification;
    } catch (error) {
      throw error;
    }
  };
}

export default NotificationRepository;
