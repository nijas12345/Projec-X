import { Model } from "mongoose";
import { ITaskRepository } from "../Interfaces/task.repository.interface";
import { IAdmin, IComments, ITask, IUser } from "../Interfaces/commonInterface";

class TaskRepository implements ITaskRepository {
  private adminModel = Model<IAdmin>;
  private userModel = Model<IUser>;
  private taskModel = Model<ITask>;
  constructor(
    adminModel: Model<IAdmin>,
    userModel: Model<IUser>,
    taskModel: Model<ITask>
  ) {
    this.adminModel = adminModel;
    this.userModel = userModel;
    this.taskModel = taskModel;
  }
  taskDetails = async (task: ITask): Promise<ITask> => {
    try {
      const taskData = await this.taskModel.create(task);
      return taskData;
    } catch (error) {
      throw error;
    }
  };
  editTask = async (task: ITask): Promise<ITask> => {
    try {
      const taskDetails: ITask | null = await this.taskModel.findOne({
        _id: task._id,
      });
      if (!taskDetails) throw new Error("No task Data available.");
      if (taskDetails.member == task.member) {
        const updateFields: ITask = {
          admin_id: task.admin_id,
          taskName: task.taskName,
          description: task.description,
          deadline: task.deadline,
          member: task.member,
          projectId: task.projectId,
          comments: task.comments,
        };
        if (task.taskImage) {
          updateFields.taskImage = task.taskImage;
        }
        // Update the task in the database
        const taskData = await this.taskModel.findByIdAndUpdate(
          { _id: task._id },
          { $set: updateFields },
          { new: true }
        );
        console.log("taskData", taskData);

        if (!taskData) {
          throw new Error("Task not found or could not be updated.");
        }
        return taskData;
      } else {
        const updateFields: ITask = {
          admin_id: task.admin_id,
          taskName: task.taskName,
          description: task.description,
          deadline: task.deadline,
          member: task.member,
          projectId: task.projectId,
          acceptanceStatus: "unAssigned",
          status: "pending",
          comments: task.comments,
        };
        if (task.taskImage) {
          updateFields.taskImage = task.taskImage;
        }
        const taskData = await this.taskModel.findByIdAndUpdate(
          { _id: task._id },
          { $set: updateFields },
          { new: true }
        );
        if (!taskData) {
          throw new Error("Task not found or could not be updated.");
        }
        return taskData;
      }
    } catch (error: any) {
      console.error("Error in editTask:", error.message);
      throw new Error(`Failed to edit task: ${error.message}`);
    }
  };

  allTasks = async (): Promise<ITask[]> => {
    try {
      const tasks: ITask[] = await this.taskModel.aggregate([
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "projectDetails",
          },
        },
        {
          $unwind: "$projectDetails",
        },
        { $sort: { deadline: 1 } },
      ]);
      return tasks;
    } catch (error) {
      throw error;
    }
  };
  mineTasks = async (user_id: string): Promise<ITask[]> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      const email = userData?.email;
      console.log(email);
      const tasks: ITask[] = await this.taskModel.aggregate([
        {
          $match: { member: email },
        },
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "projectDetails",
          },
        },
        {
          $unwind: "$projectDetails",
        },
      ]);

      return tasks;
    } catch (error) {
      throw error;
    }
  };
  assignedTasks = async (user_id: string): Promise<ITask[]> => {
    try {
      const tasks: ITask[] = await this.taskModel.aggregate([
        {
          $match: { user_id: user_id },
        },
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "projectDetails",
          },
        },
        {
          $unwind: "$projectDetails",
        },
      ]);
      return tasks;
    } catch (error) {
      throw error;
    }
  };
  showTask = async (
    user_id: string,
    taskId: string
  ): Promise<{ user: IUser | null; task: ITask | null }> => {
    try {
      const user: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      const task: ITask | null = await this.taskModel.findOne({ _id: taskId });
      return { user, task };
    } catch (error) {
      throw error;
    }
  };
  updateTaskStatus = async (
    taskId: string,
    status: string,
    projectId: string
  ): Promise<ITask[]> => {
    try {
      const taskData: ITask | null = await this.taskModel.findByIdAndUpdate(
        { _id: taskId },
        {
          status: status,
        },
        { new: true }
      );

      if (!taskData) throw new Error("NO Task Data found");
      if (!projectId) {
        const tasks: ITask[] = await this.taskModel
          .find({
            member: taskData.member,
            acceptanceStatus: "active",
          })
          .sort({
            createdAt: -1,
          });
        return tasks;
      } else {
        const tasks: ITask[] = await this.taskModel
          .find({
            member: taskData.member,
            acceptanceStatus: "active",
            projectId: taskData.projectId,
          })
          .sort({
            createdAt: -1,
          });
        return tasks;
      }
    } catch (error) {
      throw error;
    }
  };
  deleteTask = async (taskId: string): Promise<void> => {
    try {
      const taskData: ITask | null = await this.taskModel.findByIdAndDelete(
        taskId
      );
      if (!taskData) {
        throw new Error("Task not found.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task.");
    }
  };
  countTask = async (
    user_id: string
  ): Promise<{ taskData: ITask[] | null; user: IUser | null }> => {
    try {
      const taskData: ITask[] | null = await this.taskModel.find();
      const user: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      return { taskData, user };
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task.");
    }
  };
  adminCountTasks = async (admin_id: string): Promise<ITask[] | null> => {
    try {
      const taskData: ITask[] | null = await this.taskModel.find({
        admin_id: admin_id,
      });
      return taskData;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task.");
    }
  };
  adminTasks = async (
    admin_id: string,
    projectId: string | null
  ): Promise<ITask[] | null> => {
    try {
      if (projectId == "unassigned") {
        const taskData: ITask[] | null = await this.taskModel.find({
          admin_id: admin_id,
          acceptanceStatus: "unAssigned",
        });
        return taskData;
      } else if (projectId == "reassigned") {
        const taskData: ITask[] | null = await this.taskModel.find({
          admin_id: admin_id,
          acceptanceStatus: "reAssigned",
        });
        return taskData;
      } else if (!projectId) {
        const taskData: ITask[] | null = await this.taskModel.find({
          admin_id: admin_id,
          acceptanceStatus: "active",
        });
        return taskData;
      } else {
        const taskData: ITask[] | null = await this.taskModel.find({
          projectId: projectId,
          acceptanceStatus: "active",
        });
        console.log("withproject", taskData.length);
        return taskData;
      }
    } catch (error) {
      throw error;
    }
  };
  userTasks = async (
    user_id: string,
    projectId: string | null
  ): Promise<ITask[] | null> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      if (!userData) throw new Error("No user Data");
      const email = userData.email;
      console.log("email", email);

      if (projectId == "unassigned") {
        const taskData: ITask[] | null = await this.taskModel.find({
          member: email.trim(),
          acceptanceStatus: "unAssigned",
        });
        console.log("taskData", taskData.length);

        return taskData;
      } else if (!projectId) {
        const taskData: ITask[] | null = await this.taskModel
          .find({
            member: email,
            acceptanceStatus: "active",
          })
          .sort({
            acceptanceStatus: -1,
            createdAt: -1,
          });
        console.log("taskData", taskData.length);

        return taskData;
      } else if (projectId == "me") {
        const taskData: ITask[] | null = await this.taskModel
          .find({
            member: email,
            projectId: projectId,
            acceptanceStatus: "active",
          })
          .sort({
            createdAt: -1,
          });
        console.log("taskData", taskData.length);

        return taskData;
      } else {
        const taskData: ITask[] | null = await this.taskModel
          .find({
            member: email,
            projectId: projectId,
            acceptanceStatus: "active",
          })
          .sort({
            createdAt: -1,
          });
        console.log("taskData", taskData.length);

        return taskData;
      }
    } catch (error) {
      throw error;
    }
  };
  addComment = async (
    taskId: string,
    commentData: IComments
  ): Promise<ITask | null> => {
    try {
      const taskData: ITask | null = await this.taskModel.findOneAndUpdate(
        { _id: taskId },
        { $push: { comments: commentData } },
        { new: true }
      );
      return taskData;
    } catch (error) {
      throw error;
    }
  };
  addAdminComment = async (
    taskId: string,
    commentData: IComments
  ): Promise<ITask | null> => {
    try {
      const taskData: ITask | null = await this.taskModel.findOneAndUpdate(
        { _id: taskId },
        { $push: { comments: commentData } },
        { new: true }
      );
      return taskData;
    } catch (error) {
      throw error;
    }
  };
  deleteComment = async (id: string): Promise<IComments | null> => {
    try {
      console.log("id", id);
      const result: IComments | null = await this.taskModel.findOneAndUpdate(
        { "comments._id": id },
        {
          $pull: {
            comments: { _id: id },
          },
        },
        { new: true }
      );

      return result;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task.");
    }
  };
  deleteUserComment = async (id: string): Promise<IComments | null> => {
    try {
      const result: IComments | null = await this.taskModel.findOneAndUpdate(
        { "comments._id": id },
        {
          $pull: {
            comments: { _id: id },
          },
        },
        { new: true }
      );
      return result;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task.");
    }
  };
  assignedStatus = async (
    taskId: string,
    acceptanceStatus: string
  ): Promise<ITask | null> => {
    try {
      const taskData: ITask | null = await this.taskModel.findByIdAndUpdate(
        taskId,
        {
          acceptanceStatus: acceptanceStatus,
        },
        { new: true }
      );
      if (acceptanceStatus == "reAssigned") {
        const taskData = await this.taskModel.findByIdAndUpdate(taskId, {
          member: "",
        });
      }
      return taskData;
    } catch (error) {
      throw error;
    }
  };
  getSearchResults = async (
    query: string,
    projectId: string
  ): Promise<ITask[]> => {
    try {
      if (projectId === "unassigned") {
        const searchResults: ITask[] = await this.taskModel.find({
          taskName: { $regex: query, $options: "i" },
          acceptanceStatus: "unAssigned",
        });
        console.log("searchR", searchResults);

        return searchResults;
      } else if (projectId == "reassigned") {
        const searchResults: ITask[] = await this.taskModel.find({
          taskName: { $regex: query, $options: "i" },
          acceptanceStatus: "reAssigned",
        });
        console.log("searchR", searchResults);

        return searchResults;
      } else if (projectId.length > 14) {
        const searchResults: ITask[] = await this.taskModel.find({
          taskName: { $regex: query, $options: "i" },
          projectId: projectId,
          acceptanceStatus: "active",
        });
        return searchResults;
      } else {
        const searchResults: ITask[] = await this.taskModel.find({
          taskName: { $regex: query, $options: "i" },
          acceptanceStatus: "active",
        });
        return searchResults;
      }
    } catch (error) {
      throw error;
    }
  };
}

export default TaskRepository;
