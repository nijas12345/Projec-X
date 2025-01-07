import {
  IMember,
  IProject,
  IUser,
  Projects,
} from "../Interfaces/commonInterface";
import { IProjectService } from "../Interfaces/project.service.interface";
import { IProjectRepository } from "../Interfaces/project.repository.interface";

class ProjectServices implements IProjectService {
  private projectRepository: IProjectRepository;
  constructor(projectRepository: IProjectRepository) {
    this.projectRepository = projectRepository;
  }
  createProject = async (
    admin_id: string,
    projectData: IProject
  ): Promise<IProject | null> => {
    try {
      const projects: IProject | null =
        await this.projectRepository.createProject(admin_id, projectData);
      return projects;
    } catch (error) {
      throw error;
    }
  };
  getProjects = async (user_id: string): Promise<Projects[]> => {
    try {
      const projects: Projects[] = await this.projectRepository.getProjects(
        user_id
      );
      if (!projects) {
        throw new Error("Please create a project");
      }
      return projects;
    } catch (error) {
      throw error;
    }
  };
  getAdminProjects = async (admin_id: string): Promise<Projects[]> => {
    try {
      const projects: Projects[] =
        await this.projectRepository.getAdminProjects(admin_id);
      if (!projects) {
        throw new Error("Please create a project");
      }
      return projects;
    } catch (error) {
      throw error;
    }
  };
  updateProject = async (
    admin_id: string,
    projectData: IProject
  ): Promise<Projects[]> => {
    try {
      const projects: Projects[] = await this.projectRepository.updateProject(
        admin_id,
        projectData
      );
      return projects;
    } catch (error) {
      throw error;
    }
  };
  deleteProject = async (
    admin_id: string,
    projectId: string
  ): Promise<Projects[]> => {
    try {
      const projects: Projects[] = await this.projectRepository.deleteProject(
        admin_id,
        projectId
      );
      return projects;
    } catch (error) {
      throw error;
    }
  };
  projectMembers = async (projectId: string): Promise<IMember[]> => {
    try {
      const projectData: IProject | null =
        await this.projectRepository.projectMembers(projectId);
      if (projectData) {
        const projectMembers: IMember[] = projectData?.members;
        return projectMembers;
      } else {
        throw new Error("The projectId is wrong");
      }
    } catch (error) {
      throw error;
    }
  };
  chatProjects = async (user_id: string): Promise<Projects[] | null> => {
    try {
      const projectData: Projects[] | null =
        await this.projectRepository.chatProjects(user_id);
      if (!projectData) {
        throw new Error("No projects are found");
      }
      return projectData;
    } catch (error) {
      throw error;
    }
  };
  AdminchatProjects = async (admin_id: string): Promise<Projects[] | null> => {
    try {
      const projectData: Projects[] | null =
        await this.projectRepository.AdminchatProjects(admin_id);
      if (!projectData) {
        throw new Error("No projects are found");
      }
      return projectData;
    } catch (error) {
      throw error;
    }
  };
  getSelectedProject = async (project: IProject): Promise<IUser[]> => {
    try {
      const selectedMembers: IUser[] =
        await this.projectRepository.getSelectedProject(project);
      return selectedMembers;
    } catch (error) {
      throw error;
    }
  };
}

export default ProjectServices;
