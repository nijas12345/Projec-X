import { Router } from "express";
import UserController from "../Controllers/userController";
import UserServices from "../Services/userServices";
import UserRepository from "../Repositories/userRepository";
import User from "../Model/userModal";
import Project from "../Model/projectModal";
import WorkLog from "../Model/clockModal";
import Message from "../Model/chatModal";
import Meeting from "../Model/meetingModal";
import Task from "../Model/taskModal";
import upload from "../Config/multer_config";
import { verifyToken } from "../Config/jwt_config";
import ProjectRepository from "../Repositories/projectRepository";
import ProjectServices from "../Services/projectServices";
import ProjectController from "../Controllers/projectController";

import WorkLogController from "../Controllers/workLogController";
import WorkLogServices from "../Services/workLogService";
import WorkLogRepository from "../Repositories/workLogRepository";

import TaskController from "../Controllers/taskController";
import TaskServices from "../Services/taskServices";
import TaskRepository from "../Repositories/taskRepository";

import ChatController from "../Controllers/chatController";
import ChatServices from "../Services/chatServices";
import ChatRepository from "../Repositories/chatRepository";
import NotificationRepository from "../Repositories/notificationRepository";
import Notification from "../Model/notificationModal";
import NotificationService from "../Services/notificationServices";
import NotificationController from "../Controllers/notificationController";
import Company from "../Model/companyModal";
import Admin from "../Model/adminModal";
import isBlocked from "../Middlewares/userAuth";
import Payment from "../Model/paymentModal";
import CompanyController from "../Controllers/companyController";
import CompanyRepository from "../Repositories/companyRepository";
import CompanyServices from "../Services/companyServices";

const userRepository = new UserRepository(User, Company);
const userService = new UserServices(userRepository);
const userController = new UserController(userService);

const projectRepository = new ProjectRepository(
  Admin,
  User,
  Project,
  Message,
  Payment,
  Task
);
const projectService = new ProjectServices(projectRepository);
const projectController = new ProjectController(projectService);

const workLogRepository = new WorkLogRepository(User, WorkLog);
const workLogService = new WorkLogServices(workLogRepository);
const workLogController = new WorkLogController(workLogService);

const taskRepository = new TaskRepository(Admin, User, Task);
const taskService = new TaskServices(taskRepository);
const taskController = new TaskController(taskService);

const chatRepository = new ChatRepository(
  Admin,
  User,
  Message,
  Project,
  Meeting
);
const chatService = new ChatServices(chatRepository);
const chatController = new ChatController(chatService);

const notificationRepository = new NotificationRepository(
  Admin,
  User,
  Task,
  Notification
);
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

const companyRepository = new CompanyRepository(Admin, User, Company, Project);
const companyService = new CompanyServices(companyRepository);
const companyController = new CompanyController(companyService);

const user_router = Router();

user_router.post("/register", userController.register);
user_router.post("/otp", userController.otpVerification);
user_router.get("/resend-otp", userController.resendOTP);
user_router.post("/login", userController.login);
user_router.get("/logout", userController.logout);
user_router.post("/google/auth", userController.verifyGoogleAuth);
user_router.put("/reset-password", userController.resetPassword);
user_router.put("/validate-reset-token", userController.validateToken);
user_router.put("/change-password", userController.confirmResetPassword);

user_router.get(
  "/get-projects",
  verifyToken,
  isBlocked,
  projectController.getProjects
);

user_router.post(
  "/upload-profile-image",
  verifyToken,
  upload.single("profileImage"),
  userController.profilePicture
);
user_router.post("/update-user", verifyToken, userController.updateUser);

user_router.post(
  "/clock-in",
  verifyToken,
  isBlocked,
  workLogController.clockIn
);
user_router.post(
  "/clock-out",
  verifyToken,
  isBlocked,
  workLogController.clockOut
);
user_router.get(
  "/clock-status",
  verifyToken,
  isBlocked,
  workLogController.clockStatus
);
user_router.get(
  "/break-in",
  verifyToken,
  isBlocked,
  workLogController.breakStart
);
user_router.get(
  "/break-out",
  verifyToken,
  isBlocked,
  workLogController.breakEnd
);
user_router.post(
  "/schedule-clockStatus",
  isBlocked,
  workLogController.scheduleClockStatus
);
user_router.get(
  "/clock-statistics",
  verifyToken,
  isBlocked,
  workLogController.clockStatistics
);

user_router.get(
  "/project-members",
  verifyToken,
  isBlocked,
  projectController.projectMembers
);

user_router.post(
  "/create-task",
  verifyToken,
  isBlocked,
  upload.single("file"),
  taskController.taskDetails
);
user_router.patch(
  "/edit-task",
  verifyToken,
  isBlocked,
  upload.single("file"),
  taskController.editTask
);
user_router.get("/tasks/all", verifyToken, isBlocked, taskController.allTasks);
user_router.get(
  "/tasks/mine",
  verifyToken,
  isBlocked,
  taskController.mineTasks
);
user_router.get(
  "/tasks/assigned",
  verifyToken,
  isBlocked,
  taskController.assignedTasks
);
user_router.post(
  "/task-details",
  verifyToken,
  isBlocked,
  taskController.showTask
);
user_router.patch(
  "/update-task-status",
  verifyToken,
  isBlocked,
  taskController.updateTaskStatus
);
user_router.put("/tasks", verifyToken, isBlocked, taskController.userTasks);
user_router.get(
  "/count-tasks",
  verifyToken,
  isBlocked,
  taskController.countTask
);
user_router.post("/add-comment", verifyToken, taskController.addComment);
user_router.put(
  "/acceptance-status",
  verifyToken,
  taskController.assignedStatus
);
user_router.patch(
  "/delete-comment",
  verifyToken,
  taskController.deleteUserComment
);

user_router.get(
  "/get-projects/chat",
  verifyToken,
  isBlocked,
  projectController.chatProjects
);
user_router.get(
  "/messages/:projectId",
  verifyToken,
  isBlocked,
  chatController.getChats
);

user_router.get(
  "/get-notifications",
  verifyToken,
  isBlocked,
  notificationController.getNotifications
);
user_router.get(
  "/get-notifications-count",
  verifyToken,
  isBlocked,
  notificationController.getNotificationsCount
);

user_router.get(
  "/get-projects/meetings",
  verifyToken,
  isBlocked,
  chatController.getMeetings
);

user_router.patch(
  "/fetchMeetings",
  verifyToken,
  isBlocked,
  chatController.fetchMeetings
);
user_router.post(
  "/refferalCode",
  verifyToken,
  isBlocked,
  userController.addRefferalCode
);

user_router.get(
  "/company-info",
  verifyToken,
  isBlocked,
  companyController.companyName
);

export default user_router;
