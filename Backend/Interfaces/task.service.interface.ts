import { IComments, ITask, IUser } from "./commonInterface"

export interface ITaskService {
    taskDetails(taskDetails:ITask):Promise<ITask>
    allTasks():Promise<ITask[]>
    mineTasks(user_id:string):Promise<ITask[]>
    assignedTasks(user_id:string):Promise<ITask[]>
    showTask(user_id:string,taskId:string):Promise<ITask|{isAuth:boolean,taskData:ITask}>
    updateTaskStatus(taskId:string,status:string,projectId:string):Promise<ITask[]>
    deleteTask(taskId:string):Promise<void>
    countTask(user_id:string):Promise<{pending:number,inProgress:number,completed:number}>
    adminCountTasks(admin_id:string):Promise<{pending:number,inProgress:number,completed:number}>
    editTask(task:ITask):Promise<ITask>
    adminTasks(admin_id:string,projectId:string|null):Promise<ITask[]>
    userTasks(user_id:string,projectId:string|null):Promise<ITask[]>
    addComment(taskId:string,commentData:IComments):Promise<ITask>
    addAdminComment(taskId:string,commentData:IComments):Promise<ITask>
    deleteComment(id:string):Promise<IComments>
    deleteUserComment(id:string):Promise<IComments>
    assignedStatus(taskId:string,acceptanceStatus:string):Promise<ITask>
    getSearchResults(query:string,projectId:string):Promise<ITask[]>
}