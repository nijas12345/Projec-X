import mongoose, { Schema, model } from "mongoose";
import { IComments, ITask } from "../Interfaces/commonInterface";

const commentSchema: Schema = new Schema<IComments>({
  user: {
    type: String,
  },
  text: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
});
const taskSchema: Schema = new Schema<ITask>({
  admin_id: {
    type: String,
    ref: "Admin",
    required: true,
  },
  taskName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  member: {
    type: String,
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  taskImage: {
    type: String,
  },
  deadline: {
    type: String,
  },
  acceptanceStatus: {
    type: String,
    enum: ["unAssigned", "active", "reAssigned"],
    default: "unAssigned",
  },
  status: {
    type: String,
    enum: ["pending", "inProgress", "completed"],
    default: "pending",
  },
  comments: [commentSchema],
});

const Task = model<ITask>("Task", taskSchema);
export default Task;
