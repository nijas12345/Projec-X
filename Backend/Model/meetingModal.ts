import mongoose, { Schema } from "mongoose";
import { IMeeting, IMember } from "../Interfaces/commonInterface";

// Define the Message Schema
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

const meetingSchema: Schema = new Schema({
  admin_id: {
    type: String,
    ref: "Admin",
    required: true,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
  },
  projectId: {
    type: mongoose.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  MeetingTime: {
    type: Date,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
    required: true, // Optional: ensures that the status field is required
  },
  members: [memberSchema],
});

const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema);
export default Meeting;
