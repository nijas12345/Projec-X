import mongoose, { mongo } from "mongoose";
import { IWorkLog } from "../Interfaces/commonInterface";
const workLogSchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  clockIn: {
    type: Date,
    required: true,
  },
  clockOut: {
    type: Date,
    default: Date.now,
  },
  breakStart: {
    type: Date,
  },
  breakEnd: {
    type: Date,
  },
  breakDuration: {
    type: Number,
    default: 0,
  },
  workDuration: {
    type: Number,
    default: 0,
  },
  isClockedIn: {
    type: Boolean,
  },
  isOnBreak: {
    type: Boolean,
  },
});

const WorkLog = mongoose.model<IWorkLog>("WorkLog", workLogSchema);
export default WorkLog;
