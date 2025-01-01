import { IMember, IProject,IUser,Projects  } from "./commonInterface";

export interface IProjectRepository{
    createProject(user_id:string,projectData:IProject):Promise<IProject|null>
    getProjects(user_id:string):Promise<Projects[]> 
    updateProject(user_id:string,projectData:IProject):Promise<Projects[]>
    projectMembers(projectId:string):Promise<IProject|null>  
    chatProjects(user_id:string):Promise<Projects[]|null>
    AdminchatProjects(admin_id:string):Promise<Projects[]|null>
    getAdminProjects(user_id:string):Promise<Projects[]> 
    getSelectedProject(project:IProject):Promise<IUser[]>
    deleteProject(admin_id:string,projectId:string):Promise<Projects[]>
}