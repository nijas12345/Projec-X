import { IAdmin, IComments, ITask, IUser } from "./commonInterface"

export interface ITaskRepository {
    taskDetails(taskDetails:ITask):Promise<ITask>
    allTasks():Promise<ITask[]>
    mineTasks(user_id:string):Promise<ITask[]>
    assignedTasks(user_id:string):Promise<ITask[]>
    showTask(userId:string,taskId:string):Promise<{user:IUser|null,task:ITask|null}>
    updateTaskStatus(taskId:string,status:string,projectId:string):Promise<ITask[]>
    deleteTask(taskId:string):Promise<void>
    countTask(user_id:string):Promise<{taskData:ITask[]|null,user:IUser|null}>
    adminCountTasks(user_id:string):Promise<ITask[]|null>
    editTask(task:ITask):Promise<ITask>
    adminTasks(admin_id:string,projectId:string|null):Promise<ITask[]|null>
    userTasks(user_id:string,projectId:string|null):Promise<ITask[]|null>
    addComment(taskId:string,commentData:IComments):Promise<ITask|null>
    addAdminComment(taskId:string,commentData:IComments):Promise<ITask|null>
    deleteComment(id:string):Promise<IComments|null>
    deleteUserComment(id:string):Promise<IComments|null>
    assignedStatus(taskId:string,acceptanceStatus:string):Promise<ITask|null>
    getSearchResults(query:string,projectId:string):Promise<ITask[]>
}