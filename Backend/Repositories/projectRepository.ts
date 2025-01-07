import { Model } from "mongoose";
import { IProjectRepository } from "../Interfaces/project.repository.interface";
import {
  IMessage,
  IProject,
  IUser,
  Projects,
  LatestMessage,
  IAdmin,
  IMember,
  IPayment,
  ITask,
} from "../Interfaces/commonInterface";
import Project from "../Model/projectModal";

class ProjectRepository implements IProjectRepository {
  private adminModel = Model<IAdmin>;
  private userModel = Model<IUser>;
  private projectModel = Model<IProject>;
  private chatModel = Model<IMessage>;
  private paymentModel = Model<IPayment>;
  private taskModel = Model<ITask>;
  constructor(
    adminModel: Model<IAdmin>,
    userModel: Model<IUser>,
    projectModel: Model<IProject>,
    chatModel: Model<IMessage>,
    paymentModel: Model<IPayment>,
    taskModel: Model<ITask>
  ) {
    this.adminModel = adminModel;
    this.userModel = userModel;
    this.projectModel = projectModel;
    this.chatModel = chatModel;
    this.paymentModel = paymentModel;
    this.taskModel = taskModel;
  }
  createProject = async (
    admin_id: string,
    projectData: IProject
  ): Promise<IProject | null> => {
    try {
      const admin: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      if (!admin) {
        throw new Error("Admin not found");
      }
      const existingProjects: IProject[] = await this.projectModel.find({
        admin_id: admin_id,
      });

      if (existingProjects.length >= 1) {
        const paymentData: IPayment | null = await this.paymentModel.findOne({
          admin_id: admin_id,
          status: "active",
        });
        if (paymentData) {
          const companyId = admin.companyId;
          const sameEmail = admin.email;
          const memberEmails = projectData.members.map(
            (member) => member.email
          );
          const existingUsers = await this.userModel.find({
            email: { $in: memberEmails }, // Match emails in the array
            companyId: companyId, // Match the specific company ID
          });
          const missingEmails = [];
          const existingEmails = new Set(
            existingUsers.map((user) => user.email)
          );
          for (const email of memberEmails) {
            if (email == sameEmail) {
              throw new Error(
                "Added your Email in Members input. Please correct it."
              );
            }
            if (!existingEmails.has(email)) {
              missingEmails.push(email);
            }
          }
          if (missingEmails.length > 0) {
            throw new Error(
              `The following emails does not exist in the system: ${missingEmails.join(
                ", "
              )} Please invite them through company Dashboard`
            );
          }
          const projectMembers = projectData.members.map((member) => ({
            email: member.email,
            role: member.role,
          }));
          projectData.admin_id = admin_id;
          const project = new Project({
            name: projectData.name,
            description: projectData.description,
            admin_id: projectData.admin_id,
            members: projectMembers,
          });

          return await this.projectModel.create(project);
        } else {
          throw new Error(
            `Choose a subscription plan from premium page to create multiple projects`
          );
        }
      } else {
        const companyId = admin.companyId;
        const sameEmail = admin.email;
        const memberEmails = projectData.members.map((member) => member.email);
        const existingUsers = await this.userModel.find({
          email: { $in: memberEmails }, // Match emails in the array
          companyId: companyId, // Match the specific company ID
        });
        const missingEmails = [];
        const existingEmails = new Set(existingUsers.map((user) => user.email));
        for (const email of memberEmails) {
          if (email == sameEmail) {
            throw new Error(
              "Added your Email in Members input. Please correct it."
            );
          }
          if (!existingEmails.has(email)) {
            missingEmails.push(email);
          }
        }
        if (missingEmails.length > 0) {
          throw new Error(
            `The following emails does not exist in the system: ${missingEmails.join(
              ", "
            )} Please invite them through company Dashboard`
          );
        }
        const projectMembers = projectData.members.map((member) => ({
          email: member.email,
          role: member.role,
        }));
        projectData.admin_id = admin_id;
        const project = new Project({
          name: projectData.name,
          description: projectData.description,
          admin_id: projectData.admin_id,
          members: projectMembers,
        });
        return await this.projectModel.create(project);
      }
    } catch (error: any) {
      throw error;
    }
  };
  getProjects = async (user_id: string): Promise<Projects[]> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      if (!userData) throw new Error("No user Data");
      const email = userData.email;
      const projects: Projects[] = await this.projectModel
        .find({
          members: { $elemMatch: { email: email } },
        })
        .sort({ createdAt: -1 });

      return projects;
    } catch (error) {
      throw error;
    }
  };
  getAdminProjects = async (admin_id: string): Promise<Projects[]> => {
    try {
      const projects: Projects[] = await this.projectModel
        .find({ admin_id: admin_id })
        .sort({ createdAt: -1 });
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
      let admin: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      if (!admin) {
        throw new Error("User not found");
      }
      console.log(admin);
      const companyId = admin.companyId;
      const sameEmail = admin.email;
      const memberEmails = projectData.members.map((member) => member.email);
      const existingUsers = await this.userModel.find({
        email: { $in: memberEmails }, // Match emails in the array
        companyId: companyId, // Match the specific company ID
      });

      const missingEmails = [];
      const existingEmails = new Set(existingUsers.map((user) => user.email));
      console.log(existingEmails);
      for (const email of memberEmails) {
        if (email == sameEmail) {
          throw new Error(
            "Added your Email in Members input. Please correct it."
          );
        }
        if (!existingEmails.has(email)) {
          missingEmails.push(email);
        }
      }
      if (missingEmails.length > 0) {
        throw new Error(
          `The following emails does not exist in the system:${missingEmails.join(
            ", "
          )}`
        );
      }
      const projectMembers = projectData.members.map((member) => ({
        email: member.email,
        role: member.role,
      }));
      projectData.admin_id = admin_id;
      const update = {
        name: projectData.name,
        description: projectData.description,
        members: projectMembers,
        admin_id: projectData.admin_id,
      };
      const project = await this.projectModel.findOneAndUpdate(
        { _id: projectData._id },
        {
          $set: update,
        }
      );
      const projects = await this.projectModel.find();
      return projects;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  projectMembers = async (projectId: string): Promise<IProject | null> => {
    try {
      const projectData: IProject | null = await this.projectModel.findOne({
        _id: projectId,
      });
      return projectData;
    } catch (error) {
      throw error;
    }
  };
  deleteProject = async (
    admin_id: string,
    projectId: string
  ): Promise<Projects[]> => {
    try {
      const projectData: IProject | null =
        await this.projectModel.findOneAndDelete({ _id: projectId });
      await this.taskModel.deleteMany({ projectId: projectId });
      await this.chatModel.deleteMany({ projectId: projectId });
      const projects: Projects[] = await this.projectModel.find({
        admin_id: admin_id,
      });
      return projects;
    } catch (error) {
      throw error;
    }
  };
  chatProjects = async (user_id: string): Promise<Projects[] | null> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      if (!userData) {
        throw new Error("No project Data");
      }
      const userEmail: string = userData.email;

      // Find projects where the user is a member or owner
      const combinedProjects: Projects[] = await this.projectModel.find({
        $or: [{ "members.email": userEmail }, { user_id: user_id }],
      });

      const sortedProjects: Projects[] = await Promise.all(
        combinedProjects.map(async (project) => {
          const latestMessage = await this.chatModel
            .findOne({ projectId: project._id })
            .sort({ sentAt: -1 })
            .lean<LatestMessage>();
          return {
            ...project, // Spread the current project details
            latestMessage, // Attach the latest message
          };
        })
      );
      sortedProjects.sort((a, b) => {
        const dateA = a.latestMessage?.sentAt
          ? new Date(a.latestMessage.sentAt).getTime()
          : 0;
        const dateB = b.latestMessage?.sentAt
          ? new Date(b.latestMessage.sentAt).getTime()
          : 0;
        return dateB - dateA; // Descending order
      });
      return sortedProjects;
    } catch (error) {
      throw error;
    }
  };
  AdminchatProjects = async (admin_id: string): Promise<Projects[] | null> => {
    try {
      const combinedProjects: Projects[] = await this.projectModel.find({
        admin_id:admin_id
      });

      const sortedProjects: Projects[] = await Promise.all(
        combinedProjects.map(async (project) => {
          const latestMessage = await this.chatModel
            .findOne({ projectId: project._id })
            .sort({ sentAt: -1 })
            .lean<LatestMessage>();
          return {
            ...project, // Spread the current project details
            latestMessage, // Attach the latest message
          };
        })
      );
      sortedProjects.sort((a, b) => {
        const dateA = a.latestMessage?.sentAt
          ? new Date(a.latestMessage.sentAt).getTime()
          : 0;
        const dateB = b.latestMessage?.sentAt
          ? new Date(b.latestMessage.sentAt).getTime()
          : 0;
        return dateB - dateA; 
      });
      return sortedProjects;
    } catch (error) {
      throw error;
    }
  };
  getSelectedProject = async (project: IProject): Promise<IUser[]> => {
    try {
      const projectData: IProject | null = await this.projectModel.findOne({
        _id: project._id,
      });
      if (!projectData) throw new Error("No project Data");
      const memberEmails: string[] = projectData.members.map(
        (member) => member.email
      );
      const users = await this.userModel.find({ email: { $in: memberEmails } });
      return users;
    } catch (error) {
      throw error;
    }
  };
}

export default ProjectRepository;
