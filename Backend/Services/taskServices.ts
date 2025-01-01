import {
  IAdmin,
  IComments,
  IMember,
  IProject,
  ITask,
  IUser,
  Projects,
} from "../Interfaces/commonInterface";
import { ITaskRepository } from "../Interfaces/task.repository.interface";
import { ITaskService } from "../Interfaces/task.service.interface";

class TaskServices implements ITaskService {
  private taskRepository: ITaskRepository;
  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository;
  }
  taskDetails = async (task: ITask): Promise<ITask> => {
    try {
      return await this.taskRepository.taskDetails(task);
    } catch (error) {
      throw error;
    }
  };
  editTask = async (task: ITask): Promise<ITask> => {
    try {
      return await this.taskRepository.editTask(task);
    } catch (error) {
      throw error;
    }
  };
  allTasks = async (): Promise<ITask[]> => {
    try {
      return await this.taskRepository.allTasks();
    } catch (error) {
      throw error;
    }
  };
  mineTasks = async (user_id: string): Promise<ITask[]> => {
    try {
      return await this.taskRepository.mineTasks(user_id);
    } catch (error) {
      throw error;
    }
  };
  assignedTasks = async (user_id: string): Promise<ITask[]> => {
    try {
      return await this.taskRepository.assignedTasks(user_id);
    } catch (error) {
      throw error;
    }
  };
  showTask = async (
    user_id: string,
    taskId: string
  ): Promise<ITask | { isAuth: boolean; taskData: ITask }> => {
    try {
      const task = await this.taskRepository.showTask(user_id, taskId);
      console.log(task);
      if (task.user && task.task) {
        const taskData: ITask = task.task;
        if (task.user.email == task.task.member) {
          return taskData;
        }
        // else if(task.user.user_id == task.task.user_id){
        //     const isAuth:boolean = true
        //     return {isAuth,taskData}
        // }
        else {
          throw new Error("User is not authorized to view this task.");
        }
      } else {
        throw new Error("task Data is not found");
      }
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
      const taskData = await this.taskRepository.updateTaskStatus(
        taskId,
        status,
        projectId
      );
      return taskData;
    } catch (error) {
      throw error;
    }
  };
  deleteTask = async (taskId: string): Promise<void> => {
    try {
      const taskData = await this.taskRepository.deleteTask(taskId);
    } catch (error) {
      throw error;
    }
  };
  countTask = async (
    user_id: string
  ): Promise<{ pending: number; inProgress: number; completed: number }> => {
    try {
      const taskData = await this.taskRepository.countTask(user_id);
      let pending: number = 0;
      let inProgress: number = 0;
      let completed: number = 0;
      if (taskData.user && taskData.taskData) {
        const tasks: ITask[] = taskData.taskData;
        const user: IUser = taskData.user;
        const email: string = taskData.user.email;

        for (const task of tasks) {
          if (task.member == user?.email) {
            if (task.status == "pending") {
              pending++;
            } else if (task.status == "inProgress") {
              inProgress++;
            } else {
              completed++;
            }
          }
        }
      } else {
        throw new Error("NO task datas are exist");
      }
      return { pending, inProgress, completed };
    } catch (error) {
      throw error;
    }
  };
  adminCountTasks = async (
    admin_id: string
  ): Promise<{ pending: number; inProgress: number; completed: number }> => {
    try {
      const taskData: ITask[] | null =
        await this.taskRepository.adminCountTasks(admin_id);
      let pending: number = 0;
      let inProgress: number = 0;
      let completed: number = 0;
      if (taskData?.length) {
        for (const task of taskData) {
          if (task.status == "pending") {
            pending++;
          } else if (task.status == "inProgress") {
            inProgress++;
          } else {
            completed++;
          }
        }
      } else {
        throw new Error("No task Data");
      }
      return { pending, inProgress, completed };
    } catch (error) {
      throw error;
    }
  };
  adminTasks = async (
    admin_id: string,
    projectId: string | null
  ): Promise<ITask[]> => {
    try {
      const tasks: ITask[] | null = await this.taskRepository.adminTasks(
        admin_id,
        projectId
      );
      if (!tasks?.length) throw new Error("No task Data");
      return tasks;
    } catch (error) {
      throw error;
    }
  };
  userTasks = async (
    user_id: string,
    projectId: string | null
  ): Promise<ITask[]> => {
    try {
      const tasks: ITask[] | null = await this.taskRepository.userTasks(
        user_id,
        projectId
      );
      if (!tasks?.length) throw new Error("No task Data");
      return tasks;
    } catch (error) {
      throw error;
    }
  };
  addComment = async (
    taskId: string,
    commentData: IComments
  ): Promise<ITask> => {
    try {
      const taskData: ITask | null = await this.taskRepository.addComment(
        taskId,
        commentData
      );
      if (!taskData) throw new Error("No task Data exists");
      return taskData;
    } catch (error) {
      throw error;
    }
  };
  addAdminComment = async (
    taskId: string,
    commentData: IComments
  ): Promise<ITask> => {
    try {
      const taskData: ITask | null = await this.taskRepository.addAdminComment(
        taskId,
        commentData
      );
      if (!taskData) throw new Error("No task Data exists");
      return taskData;
    } catch (error) {
      throw error;
    }
  };
  deleteComment = async (id: string): Promise<IComments> => {
    try {
      console.log("id", id);

      const result: IComments | null = await this.taskRepository.deleteComment(
        id
      );
      if (!result) {
        throw new Error("No comment has been deleted");
      }
      return result;
    } catch (error) {
      throw error;
    }
  };
  deleteUserComment = async (id: string): Promise<IComments> => {
    try {
      console.log("id", id);

      const result: IComments | null =
        await this.taskRepository.deleteUserComment(id);
      if (!result) {
        throw new Error("No comment has been deleted");
      }
      return result;
    } catch (error) {
      throw error;
    }
  };
  assignedStatus = async (
    taskId: string,
    acceptanceStatus: string
  ): Promise<ITask> => {
    try {
      const taskData: ITask | null = await this.taskRepository.assignedStatus(
        taskId,
        acceptanceStatus
      );
      if (!taskData) throw new Error("No task data");
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
      const searchResults: ITask[] = await this.taskRepository.getSearchResults(
        query,
        projectId
      );
      return searchResults;
    } catch (error) {
      throw error;
    }
  };
}

export default TaskServices;
