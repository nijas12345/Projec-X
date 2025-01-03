import { Router } from "express";

import AdminRepository from "../Repositories/adminRepository";
import AdminServices from "../Services/adminServices";
import AdminController from "../Controllers/adminController";
import Admin from "../Model/adminModal";
import { adminVerifyToken } from "../Config/jwt_config";
import CompanyRepository from "../Repositories/companyRepository";
import CompanyServices from "../Services/companyServices";
import CompanyController from "../Controllers/companyController";
import Company from "../Model/companyModal";
import ProjectController from "../Controllers/projectController";
import ProjectRepository from "../Repositories/projectRepository";
import ProjectServices from "../Services/projectServices";
import User from "../Model/userModal";
import Project from "../Model/projectModal";
import Message from "../Model/chatModal";
import Task from "../Model/taskModal";
import TaskRepository from "../Repositories/taskRepository";
import TaskServices from "../Services/taskServices";
import TaskController from "../Controllers/taskController";
import upload from "../Config/multer_config";
import ChatRepository from "../Repositories/chatRepository";
import ChatServices from "../Services/chatServices";
import ChatController from "../Controllers/chatController";
import Meeting from "../Model/meetingModal";
import Payment from "../Model/paymentModal";
import NotificationRepository from "../Repositories/notificationRepository";
import NotificationService from "../Services/notificationServices";
import NotificationController from "../Controllers/notificationController";
import Notification from "../Model/notificationModal";

const adminRepository = new AdminRepository(Admin, User, Payment);
const adminService = new AdminServices(adminRepository);
const adminController = new AdminController(adminService);

const companyRepository = new CompanyRepository(Admin, User, Company, Project);
const companyService = new CompanyServices(companyRepository);
const companyController = new CompanyController(companyService);

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

const admin_router = Router();

admin_router.post("/register", adminController.register);
admin_router.post("/otp", adminController.otpVerification);
admin_router.get("/resend-otp", adminController.resendOTP);
admin_router.post("/login", adminController.login);
admin_router.post("/google/auth", adminController.verifyGoogleAuth);
admin_router.put("/reset-password", adminController.resetPassword);
admin_router.put("/validate-reset-token", adminController.validateToken);
admin_router.put("/change-password", adminController.confirmResetPassword);

admin_router.get("/logout", adminController.logout);
admin_router.post(
  "/upload-profile-image",
  adminVerifyToken,
  upload.single("file"),
  adminController.adminProfilePicture
);
admin_router.post("/payment", adminVerifyToken, adminController.payment);

admin_router.get(
  "/get-notifications",
  adminVerifyToken,
  notificationController.getAdminNotifications
);
admin_router.get(
  "/get-notifications-count",
  adminVerifyToken,
  notificationController.adminNotificationsCount
);

admin_router.post(
  "/update-user",
  adminVerifyToken,
  adminController.updateAdmin
);

admin_router.post(
  "/companyDetails",
  adminVerifyToken,
  companyController.companyDetails
);

admin_router.post(
  "/create-project",
  adminVerifyToken,
  projectController.createProject
);
admin_router.get(
  "/get-projects",
  adminVerifyToken,
  projectController.getAdminProjects
);
admin_router.put(
  "/update-project",
  adminVerifyToken,
  projectController.updateProject
);
admin_router.get(
  "/project-members",
  adminVerifyToken,
  projectController.projectMembers
);
admin_router.put(
  "/delete-project",
  adminVerifyToken,
  projectController.deleteProject
);
admin_router.post(
  "/create-task",
  adminVerifyToken,
  upload.single("file"),
  taskController.taskDetails
);
admin_router.put("/tasks", adminVerifyToken, taskController.adminTasks);
admin_router.patch(
  "/edit-task",
  adminVerifyToken,
  upload.single("file"),
  taskController.editTask
);
admin_router.patch("/delete-task", adminVerifyToken, taskController.deleteTask);
admin_router.get(
  "/count-tasks",
  adminVerifyToken,
  taskController.adminCountTasks
);
admin_router.post(
  "/add-comment",
  adminVerifyToken,
  taskController.addAdminComment
);
admin_router.patch(
  "/delete-comment",
  adminVerifyToken,
  taskController.deleteComment
);

admin_router.get(
  "/company-members",
  adminVerifyToken,
  companyController.companyMembers
);
admin_router.put("/user-block", adminVerifyToken, adminController.blockUser);
admin_router.put(
  "/user-unBlock",
  adminVerifyToken,
  adminController.unBlockUser
);
admin_router.get(
  "/company-data",
  adminVerifyToken,
  companyController.companyData
);
admin_router.put(
  "/invitation",
  adminVerifyToken,
  companyController.invitationUsers
);
admin_router.patch(
  "/inviteUser",
  adminVerifyToken,
  companyController.inviteUser
);
admin_router.patch(
  "/get-selected-projects",
  adminVerifyToken,
  projectController.getSelectedProject
);
admin_router.get(
  "/company-info",
  adminVerifyToken,
  companyController.companyInfo
);

admin_router.get(
  "/get-projects/chat",
  adminVerifyToken,
  projectController.chatProjects
);
admin_router.get(
  "/messages/:projectId",
  adminVerifyToken,
  chatController.getAdminChats
);
admin_router.get(
  "/get-projects/meetings",
  adminVerifyToken,
  chatController.getAdminMeetings
);
admin_router.get(
  "/project-members",
  adminVerifyToken,
  projectController.projectMembers
);
admin_router.post(
  "/schedule-meeting",
  adminVerifyToken,
  chatController.scheduleMeeting
);
admin_router.put(
  "/fetchMeetings",
  adminVerifyToken,
  chatController.AdminfetchMeetings
);
admin_router.patch(
  "/updateStatus",
  adminVerifyToken,
  chatController.updateMeetingStatus
);
admin_router.get("/search", adminVerifyToken, taskController.getSearchResults);

export default admin_router;
