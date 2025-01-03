import { Request, Response } from "express";
import { IComments, ITask } from "../Interfaces/commonInterface";
import { ITaskService } from "../Interfaces/task.service.interface";
import HTTP_statusCode from "../Enums/httpStatusCode";
import cloudinary from "../Config/cloudinary_config";
import { HttpStatusCode } from "axios";
import fs from "fs/promises";

class TaskController {
  private taskService: ITaskService;
  constructor(taskService: ITaskService) {
    this.taskService = taskService;
  }
  taskDetails = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const file = req.file;
      if (!file) {
        console.log("file");

        const tasks: ITask = {
          admin_id: admin_id,
          taskName: req.body.taskName,
          description: req.body.description,
          member: req.body.assigny,
          deadline: req.body.deadline,
          projectId: req.body.selectedProject,
          comments: req.body.comments,
        };
        const serviceResponse = await this.taskService.taskDetails(tasks);
        res.status(HttpStatusCode.Ok).json(serviceResponse);
      } else {
        const result = await cloudinary.uploader.upload(
          file.path,
          { folder: "uploads" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
            } else {
              console.log("Cloudinary upload result:", result);
            }
          }
        );
        const tasks: ITask = {
          admin_id: admin_id,
          taskName: req.body.taskName,
          description: req.body.description,
          member: req.body.assigny,
          taskImage: result.secure_url,
          deadline: req.body.deadline,
          projectId: req.body.selectedProject,
          comments: req.body.comments,
        };
        try {
          await fs.unlink(file.path); // Deletes the file
          console.log("Local file deleted successfully");
        } catch (deleteError) {
          console.error("Error deleting local file:", deleteError);
        }
        const serviceResponse = await this.taskService.taskDetails(tasks);
        res.status(HttpStatusCode.Ok).send(serviceResponse);
      }
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  editTask = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const file = req.file;
      if (!file) {

        const tasks: ITask = {
          admin_id: admin_id,
          _id: req.body.id,
          taskName: req.body.taskName,
          description: req.body.description,
          member: req.body.assigny,
          deadline: req.body.deadline,
          projectId: req.body.selectedProject,
          comments: req.body.comments,
        };
        const serviceResponse = await this.taskService.editTask(tasks);
        res.status(HttpStatusCode.Ok).json(serviceResponse);
      } else {
        const result = await cloudinary.uploader.upload(
          file.path,
          { folder: "uploads" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
            } else {
              console.log("Cloudinary upload result:", result);
            }
          }
        );
        try {
          await fs.unlink(file.path); // Deletes the file
          console.log("Local file deleted successfully");
        } catch (deleteError) {
          console.error("Error deleting local file:", deleteError);
        }
        const tasks: ITask = {
          admin_id: admin_id,
          _id: req.body.id,
          taskName: req.body.taskName,
          description: req.body.description,
          member: req.body.assigny,
          taskImage: result.secure_url,
          deadline: req.body.deadline,
          projectId: req.body.selectedProject,
          comments: req.body.comments,
        };
        const serviceResponse = await this.taskService.editTask(tasks);
        res.status(HttpStatusCode.Ok).json(serviceResponse);
      }
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  allTasks = async (req: Request, res: Response) => {
    try {
      const serviceResponse = await this.taskService.allTasks();
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  mineTasks = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.taskService.mineTasks(user_id);

      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  assignedTasks = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.taskService.assignedTasks(user_id);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  showTask = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const taskId = req.body.taskId;
      const serviceResponse = await this.taskService.showTask(user_id, taskId);

      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  updateTaskStatus = async (req: Request, res: Response) => {
    try {
      const projectId = req.body.projectId as string;
      console.log("projectId", projectId);

      const taskId = req.body.taskId as string;
      const status = req.body.status as string;
      const serviceResponse = await this.taskService.updateTaskStatus(
        taskId,
        status,
        projectId
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  deleteTask = async (req: Request, res: Response) => {
    try {
      const taskId = req.body.taskId as string;
      await this.taskService.deleteTask(taskId);
      res.status(HttpStatusCode.Ok).send();
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  countTask = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.taskService.countTask(user_id);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  adminCountTasks = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const serviceResponse = await this.taskService.adminCountTasks(admin_id);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  adminTasks = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const { projectId } = req.body;
      const serviceResponse = await this.taskService.adminTasks(
        admin_id,
        projectId
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  userTasks = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const { projectId } = req.body;
      console.log("projectId", projectId);

      const serviceResponse = await this.taskService.userTasks(
        user_id,
        projectId
      );

      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  addAdminComment = async (req: Request, res: Response) => {
    try {
      const taskId = req.body.taskId as string;
      const commentData: IComments = req.body.commentData;
      const serviceResponse = await this.taskService.addAdminComment(
        taskId,
        commentData
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  addComment = async (req: Request, res: Response) => {
    try {
      const taskId = req.body.taskId as string;
      const commentData: IComments = req.body.commentData;
      const serviceResponse = await this.taskService.addComment(
        taskId,
        commentData
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  deleteComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      console.log("id", id);

      const serviceResponse = await this.taskService.deleteComment(id);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  deleteUserComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      const serviceResponse = await this.taskService.deleteUserComment(id);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  assignedStatus = async (req: Request, res: Response) => {
    try {
      const { taskId, acceptanceStatus } = req.body;
      const serviceResponse = await this.taskService.assignedStatus(
        taskId,
        acceptanceStatus
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  getSearchResults = async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      const projectId = req.query.projectId as string;
      console.log("query", query);
      console.log("project", projectId);

      const serviceResponse = await this.taskService.getSearchResults(
        query,
        projectId
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
}

export default TaskController;
