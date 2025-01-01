import mongoose, { Schema } from "mongoose";
import { IMember, IProject } from "../Interfaces/commonInterface";

const memberSchema: Schema = new Schema<IMember>({
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "Member"],
  },
});

const projectSchema: Schema = new Schema<IProject>({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  admin_id: {
    type: String,
    ref: "Admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  members: [memberSchema],
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
});

const Project = mongoose.model<IProject>("Project", projectSchema);
export default Project;
