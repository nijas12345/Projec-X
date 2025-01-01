import { Request, Response } from "express";
import { IProjectService } from "../Interfaces/project.service.interface";
import HTTP_statusCode from "../Enums/httpStatusCode";
import { IProject } from "../Interfaces/commonInterface";
import { HttpStatusCode } from "axios";

class ProjectController {
  private projectService: IProjectService;
  constructor(projectService: IProjectService) {
    this.projectService = projectService;
  }
  createProject = async (req: Request, res: Response) => {
    try {
      const admin_id: string = req.admin_id as string;
      const projectData: IProject = req.body;
      const serviceResponse = await this.projectService.createProject(
        admin_id,
        projectData
      );
      console.log(serviceResponse);

      res.status(200).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      console.log(message);
      res.status(HTTP_statusCode.NoAccess).json({ message: message });
    }
  };
  getProjects = async (req: Request, res: Response) => {
    try {
      const user_id: string = req.user_id as string;
      const serviceResponse = await this.projectService.getProjects(user_id);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      console.log(message);
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  getAdminProjects = async (req: Request, res: Response) => {
    try {
      const admin_id: string = req.admin_id as string;
      const serviceResponse = await this.projectService.getAdminProjects(
        admin_id
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      console.log(message);
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  updateProject = async (req: Request, res: Response) => {
    try {
      const admin_id: string = req.admin_id as string;
      const projectData: IProject = req.body;
      const serviceResponse = await this.projectService.updateProject(
        admin_id,
        projectData
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      console.log(message);
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  deleteProject = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const projectId = req.body.projectId as string;
      console.log("project", projectId);

      const serviceResponse = await this.projectService.deleteProject(
        admin_id,
        projectId
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      console.log(message);
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  projectMembers = async (req: Request, res: Response) => {
    try {
      const projectId = req.query.projectId as string;
      const serviceResponse = await this.projectService.projectMembers(
        projectId
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  chatProjects = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.projectService.chatProjects(user_id);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  AdminchatProjects = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const serviceResponse = await this.projectService.AdminchatProjects(
        admin_id
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };

  getSelectedProject = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const project = req.body.project as IProject;
      const serviceResponse = await this.projectService.getSelectedProject(
        project
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
}

export default ProjectController;
