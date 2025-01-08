import { sendInvitationLink } from "../Config/email_config";
import {
  IAdmin,
  ICompany,
  ICompanyMember,
  IMember,
  IProject,
  IUser,
} from "../Interfaces/commonInterface";
import { ICompanyRepository } from "../Interfaces/company.repository.interface";
import { ICompanyService } from "../Interfaces/company.service.interface";
class CompanyServices implements ICompanyService {
  private companyRepository: ICompanyRepository;
  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
  }
  companyDetails = async (
    companyData: ICompany,
    admin_id: string
  ): Promise<IAdmin> => {
    const companyTwoAlphabets = companyData.companyName.slice(0, 2);
    const generatedOtp: string = Math.floor(
      1000 + Math.random() * 9000
    ).toString();
    const refferalCode: string = companyTwoAlphabets + generatedOtp;
    companyData.refferalCode = refferalCode;

    const { adminData, companyDetails } =
      await this.companyRepository.companyDetails(companyData, admin_id);
    if (!adminData) throw new Error("No admin Data found");
    if (!companyDetails) throw new Error("No Company Data found");
    const members: string[] = companyDetails.members.map(
      (member) => member.email
    );
    for (const member of members) {
      const isMailSended = await sendInvitationLink(member, refferalCode);
      if (!isMailSended) {
        throw new Error("Email not send");
      }
    }
    return adminData;
  };
  companyMembers = async (admin_id: string): Promise<ICompanyMember[]> => {
    try {
      const companyMembers: ICompanyMember[] =
        await this.companyRepository.companyMembers(admin_id);
      if (!companyMembers) throw new Error("No company Data");
      return companyMembers;
    } catch (error) {
      throw error;
    }
  };
  searchMembers = async (admin_id: string,searchQuery:string,selectedProject:IProject|null): Promise<ICompanyMember[]|IUser[]> => {
    try {
      if(selectedProject){
        return await this.companyRepository.searchProjectMembers(searchQuery,selectedProject)
      }
      else{
        return await this.companyRepository.searchMembers(admin_id,searchQuery)
      }
    } catch (error) {
      throw error;
    }
  };
  companyData = async (admin_id: string): Promise<string> => {
    try {
      const companyData: ICompany | null =
        await this.companyRepository.companyData(admin_id);
      if (!companyData) throw new Error("No company Data availabe");
      return companyData.companyName;
    } catch (error) {
      throw error;
    }
  };
  inviationUsers = async (
    admin_id: string,
    members: IMember[]
  ): Promise<ICompanyMember[]> => {
    try {
      const { refferalCode, companyMembers } =
        await this.companyRepository.inviationUsers(admin_id, members);
      const newMembers: string[] = members.map((member) => member.email);
      for (const member of newMembers) {
        const isMailSended = await sendInvitationLink(member, refferalCode);
        if (!isMailSended) {
          throw new Error("Email not send");
        }
        console.log("Mail sended");
      }
      return companyMembers;
    } catch (error) {
      throw error;
    }
  };
  inviteUser = async (admin_id: string, email: string): Promise<void> => {
    try {
      const refferalCode = await this.companyRepository.inviteUser(admin_id);
      const isMailSended = await sendInvitationLink(email, refferalCode);
      if (!isMailSended) {
        throw new Error("Email not send");
      }
    } catch (error) {
      throw error;
    }
  };
  companyInfo = async (
    admin_id: string
  ): Promise<{
    companyName: string;
    userCount: number;
    projectCount: number;
    premium:string
  }> => {
    try {
      const companyInfo = await this.companyRepository.companyInfo(admin_id);
      return companyInfo;
    } catch (error) {
      throw error;
    }
  };
  companyName = async (user_id: string): Promise<string> => {
    try {
      const companyDetails: ICompany | null =
        await this.companyRepository.companyName(user_id);
      if (!companyDetails) throw new Error("No company name exists");
      return companyDetails?.companyName;
    } catch (error) {
      throw error;
    }
  };
}
export default CompanyServices;
