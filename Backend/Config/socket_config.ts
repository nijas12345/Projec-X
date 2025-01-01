import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

import User from "../Model/userModal";
import Message from "../Model/chatModal";
import Task from "../Model/taskModal";
import Notification from "../Model/notificationModal";

import ChatServices from "../Services/chatServices";
import UserRepository from "../Repositories/userRepository";
import ChatRepository from "../Repositories/chatRepository";
import Project from "../Model/projectModal";
import NotificationRepository from "../Repositories/notificationRepository";
import NotificationServices from "../Services/notificationServices";
import Meeting from "../Model/meetingModal";
import Company from "../Model/companyModal";
import Admin from "../Model/adminModal";
import cloudinary from "./cloudinary_config";

const userRepository = new UserRepository(User, Company);
const chatRepository = new ChatRepository(
  Admin,
  User,
  Message,
  Project,
  Meeting
);
const chatService = new ChatServices(chatRepository);
const notificationRepository = new NotificationRepository(
  Admin,
  User,
  Task,
  Notification
);
const notificationService = new NotificationServices(notificationRepository);

let io: SocketServer;
let onlineUser: { [key: string]: string } = {};
let onlineUsers: { [key: string]: string } = {};

const configSocketIO = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id}`);
    socket.on("userOnline", (userId) => {
      onlineUsers[userId] = socket.id;
      console.log("onlineUsers", onlineUsers);

      console.log("onlineUsers", onlineUsers[userId]);
      console.log(`User ${userId} is online with socket ID ${socket.id}`);
    });
    socket.on("useroffline", (userId) => {
      if (onlineUsers[userId]) {
        delete onlineUsers[userId];
        console.log(`User ${userId} disconnected manually.`);
      }
    });

    // User joins a group chat room based on projectId
    socket.on("joinRoom", ({ userID, projectId }) => {
      const roomName = `project-${projectId}`;
      onlineUser[userID] = socket.id;
      socket.join(roomName);
      io.to(roomName).emit("userJoinedGroup", { userID, projectId });
      console.log(`User ${userID} joined project room: ${roomName}`);
    });

    socket.on("leaveRoom", ({ userID, projectId }) => {
      const roomName = `project-${projectId}`;
      socket.leave(roomName);
      if (onlineUser[userID]) {
        delete onlineUser[userID];
      }
      io.to(roomName).emit("userLeftGroup", { userID, projectId });
      console.log(`User ${userID} left project room: ${roomName}`);
    });

    socket.on("typing", (data) => {
      console.log(`User Typing Event:`, data); // Logs the data object
      const roomName = `project-${data.projectId}`;
      console.log(`Emitting to room: ${roomName}`);
      socket.to(roomName).emit("userTyping", data);
    });

    socket.on("stopTyping", (data) => {
      console.log(`User Stop Typing Event:`, data); // Logs the data object
      const roomName = `project-${data.projectId}`;
      console.log(`Emitting stopTyping to room: ${roomName}`);
      socket.to(roomName).emit("userStopTyping", data);
    });

    socket.on("sendGroupMessage", async (messageDetails) => {
      try {
        const savedMessage = await chatService.saveChats(messageDetails);
        const roomName = `project-${messageDetails.projectId}`;
        socket.join(roomName);
        io.to(roomName).emit("receiveGroupMessage", savedMessage);
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("sendGroupMessageWithFile", async (messageWithFile) => {
      try {
        const roomName = `project-${messageWithFile.projectId}`;
        socket.join(roomName);

        if (messageWithFile.imageFile) {
          const { data, name, type } = messageWithFile.imageFile;
          console.log(data, name, type);

          const uploadResult = await cloudinary.uploader.upload(data, {
            folder: "project_files",
            resource_type: "auto",
            public_id: name,
          });
          messageWithFile.imageFile = {
            name: name,
            type: "image/jpeg",
            url: uploadResult.secure_url,
          };
        }
        const savedMessage = await chatService.saveFiles(messageWithFile);

        socket.to(roomName).emit("receiveImageFile", savedMessage);
      } catch (error) {
        console.log(error);
      }
    });

    // Joining a notification room for a specific project
    socket.on("sendNotification", async (notificationDetails) => {
      const savedNotification = await notificationService.saveNotification(
        notificationDetails
      );
      const { assignedUserId, message } = savedNotification;
      const socketId = onlineUsers[assignedUserId];

      if (socketId) {
        io.to(socketId).emit("receiveNotification", { message });
        console.log(`Notification sent to user ${assignedUserId}`);
      } else {
        console.log(`User ${assignedUserId} is offline`);
      }
    });
    socket.on("userSendNotification", async (notificationDetails) => {
      const savedNotification = await notificationService.userSaveNotification(
        notificationDetails
      );
      const { admin_id, message } = savedNotification;
      console.log("admin", admin_id);

      const socketId = onlineUsers[admin_id];

      if (socketId) {
        io.to(socketId).emit("receiveUserNotification", { message });
        console.log(`Notification sent to user ${admin_id}`);
      } else {
        console.log(`User ${admin_id} is offline`);
      }
    });

    socket.on("disconnect", () => {
      // Find and remove the user from onlineUser
      const disconnectChatUser = Object.keys(onlineUser).find(
        (userID) => onlineUser[userID] === socket.id
      );
      if (disconnectChatUser) {
        delete onlineUser[disconnectChatUser];
        io.emit("userDisconnectedChat", { userID: disconnectChatUser });
        console.log(`Chat user ${disconnectChatUser} disconnected.`);
      }

      // Find and remove the user from onlineUsers
      const disconnectHomeUser = Object.keys(onlineUsers).find(
        (userID) => onlineUsers[userID] === socket.id
      );
      if (disconnectHomeUser) {
        delete onlineUsers[disconnectHomeUser];
        io.emit("userDisconnectedHome", { userID: disconnectHomeUser });
        console.log(`Home user ${disconnectHomeUser} disconnected.`);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export { configSocketIO, io };
