import { ICompany, IAdmin, IUser, IMember, ICompanyMember} from "./commonInterface";

export interface ICompanyRepository{
  companyDetails(companyData:ICompany,admin_id:string):Promise<{adminData:IAdmin|null,companyDetails:ICompany}>
  companyMembers(admin_id:string):Promise<ICompanyMember[]>
  companyData(admin_id:string):Promise<ICompany|null>
  inviationUsers(admin_id:string,members:IMember[]):Promise<{refferalCode:string,companyMembers:ICompanyMember[]}>
  inviteUser(admin_id:string):Promise<string>
  companyInfo(admin_id:string):Promise<{companyName:string,userCount:number,projectCount:number}>
  companyName(user_id:string):Promise<ICompany|null>
}
