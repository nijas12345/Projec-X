import mongoose, { Schema } from "mongoose";
import { IMessage } from "../Interfaces/commonInterface";

const messageSchema: Schema = new Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  senderId: {
    type: String,
    refPath: "senderRole",
    required: true,
  },
  senderRole: {
    type: String,
    enum: ["Admin", "User"],
  },
  senderName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: "",
  },
  sentAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  time: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  sent: {
    type: Boolean,
    default: false,
  },
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  imageFile: {
    name: { type: String },
    type: { type: String },
    data: { type: String },
    url: { type: String },
  },
});

const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
export default MessageModel;
