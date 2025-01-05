import { IAdmin, ICompany, ICompanyMember, IMember, IProject, IUser } from "./commonInterface";

export interface ICompanyService{
  companyDetails(companyData:ICompany,user_id:string):Promise<IAdmin>
  companyMembers(admin_id:string):Promise<ICompanyMember[]>
  companyData(admin_id:string):Promise<string>
  inviationUsers(admin_id:string,members:IMember[]):Promise<ICompanyMember[]>
  inviteUser(admin_id:string,email:string):Promise<void>
  companyInfo(admin_id:string):Promise<{companyName:string,userCount:number,projectCount:number}>
  companyName(user_id:string):Promise<string>
  searchMembers(admin_id:string,searchQuery:string,selectedProject:IProject|null):Promise<ICompanyMember[]|IUser[]>
}