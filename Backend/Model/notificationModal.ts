import mongoose, { Schema, model } from "mongoose";
import { INotification } from "../Interfaces/commonInterface"; // Assuming you have an interface file

const notificationSchema: Schema = new Schema<INotification>({
  admin_id: {
    type: String,
    ref: "Admin",
    required: true,
  },
  assignedUserId: {
    type: String,
    ref: "User",
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task", // Reference to Task model
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notificationType: {
    type: String,
    enum: ["Admin", "User"],
    required: true,
  },
});

const Notification = model<INotification>("Notification", notificationSchema);

export default Notification;
