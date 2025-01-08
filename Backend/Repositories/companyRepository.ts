import { Model } from "mongoose";
import {
  IAdmin,
  ICompany,
  ICompanyMember,
  IMember,
  IPayment,
  IProject,
  IUser,
} from "../Interfaces/commonInterface";
import { ICompanyRepository } from "../Interfaces/company.repository.interface";
import { log } from "node:console";

class CompanyRepository implements ICompanyRepository {
  private adminModel = Model<IAdmin>;
  private userModel = Model<IUser>;
  private companyModel = Model<ICompany>;
  private projectModel = Model<IProject>;
  private paymentModel = Model<IPayment>
  constructor(
    adminModel: Model<IAdmin>,
    userModel: Model<IUser>,
    companyModel: Model<ICompany>,
    projectModel: Model<IProject>,
    paymentModel:Model<IPayment>
  ) {
    this.companyModel = companyModel;
    this.adminModel = adminModel;
    this.userModel = userModel;
    this.projectModel = projectModel;
    this.paymentModel = paymentModel;
  }
  companyDetails = async (
    companyData: ICompany,
    admin_id: string
  ): Promise<{ adminData: IAdmin | null; companyDetails: ICompany }> => {
    try {
      const existCompanyData: ICompany | null = await this.companyModel.findOne(
        { companyName: companyData.companyName }
      );
      if (existCompanyData) throw new Error("CompanyData exists");
      const companyDetails: ICompany = await this.companyModel.create(
        companyData
      );
      const adminData: IAdmin | null = await this.adminModel.findOneAndUpdate(
        { admin_id: admin_id },
        {
          companyId: companyDetails._id,
        },
        { new: true }
      );
      console.log(adminData);
      return { adminData, companyDetails };
    } catch (error) {
      throw error;
    }
  };
  companyMembers = async (admin_id: string): Promise<ICompanyMember[]> => {
    try {
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      if (!adminData) throw new Error("No admin Data");
      const companyId = adminData.companyId;
      const companyData: ICompany | null = await this.companyModel.findOne({
        _id: companyId,
      });
      if (!companyData) throw new Error("Company Error");
      const members: ICompanyMember[] = companyData.members;
      console.log("members",members);
      
      const sortedMembers = members.sort((a, b) => {
        return (
          new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
        );
      });
      return sortedMembers;
    } catch (error) {
      throw error;
    }
  };
  searchMembers = async (
    admin_id: string,
    searchQuery: string
  ): Promise<ICompanyMember[]> => {
    try {
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      if (!adminData) throw new Error("No admin data");

      // Step 2: Fetch company data
      const companyData: ICompany | null = await this.companyModel.findOne({
        _id: adminData.companyId,
      });
      if (!companyData) throw new Error("Company not found");

      const matchedMembers = companyData.members
        .filter((member) => new RegExp(searchQuery, "i").test(member.email)) // Filter by email
        .sort(
          (a, b) =>
            new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
        );

      return matchedMembers;
    } catch (error) {
      throw error;
    }
  };
  searchProjectMembers = async (
    searchQuery: string,
    selectedProject: IProject
  ): Promise<IUser[]> => {
    try {
      const projectData: IProject | null = await this.projectModel.findOne({
        _id: selectedProject._id,
      });
      if (!projectData) {
        throw new Error("No project data found");
      }
      const memberEmails: string[] = projectData.members.map(
        (member) => member.email
      );

      const searchRegex = new RegExp(searchQuery, "i"); 
      const users: IUser[] = await this.userModel.find({
        email: { $in: memberEmails, $regex: searchRegex },
      });

      return users;
    } catch (error) {
      throw error;
    }
  };
  companyData = async (admin_id: string): Promise<ICompany | null> => {
    try {
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      if (!adminData) throw new Error("No admin Data");
      const companyId = adminData.companyId;
      const companyData: ICompany | null = await this.companyModel.findOne({
        _id: companyId,
      });
      return companyData;
    } catch (error) {
      throw error;
    }
  };
  inviationUsers = async (
    admin_id: string,
    members: IMember[]
  ): Promise<{ refferalCode: string; companyMembers: ICompanyMember[] }> => {
    try {
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      if (!adminData) throw new Error("No Admin Data found");
      const companyId: string = adminData?.companyId;
      const companyData: ICompany | null = await this.companyModel.findOne({
        _id: companyId,
      });
      if (!companyData) throw new Error("No Company Data found");
      const updatedCompany: ICompany | null =
        await this.companyModel.findOneAndUpdate(
          { _id: companyId },
          { $addToSet: { members: { $each: members } } },
          { new: true }
        );
      if (!updatedCompany) throw new Error("No members modified");
      const companyMembers: ICompanyMember[] = updatedCompany.members.sort(
        (a, b) =>
          new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
      );
      const refferalCode: string = companyData.refferalCode;
      return { refferalCode, companyMembers };
    } catch (error) {
      throw error;
    }
  };
  inviteUser = async (admin_id: string): Promise<string> => {
    try {
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      if (!adminData) throw new Error("No Admin Data found");
      const companyId: string = adminData?.companyId;
      const companyData: ICompany | null = await this.companyModel.findOne({
        _id: companyId,
      });
      if (!companyData) throw new Error("No company Data");
      const refferalCode: string = companyData.refferalCode;
      return refferalCode;
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
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      const paymentData: IPayment | null = await this.paymentModel.findOne({
                admin_id: admin_id,
                status: "active",
      });
      let premium:string
      if(paymentData){
           premium = paymentData.subscription.charAt(0).toUpperCase()+paymentData.subscription.slice(1) +"Premium"
      }
      else{
         premium = "Go Premium"
      }
      if (!adminData) throw new Error("No Admin Data found");
      const companyId = adminData.companyId;
      const companyInfo: ICompany | null = await this.companyModel.findOne({
        _id: companyId,
      });
      if (!companyInfo) throw new Error("No company Exist");
      const companyName: string = companyInfo?.companyName;
      const userCount: number = await this.userModel.countDocuments({
        companyId: companyId,
      });
      const projectCount = await this.projectModel.countDocuments({
        admin_id: admin_id,
      });
      return { companyName, userCount, projectCount,premium };
    } catch (error) {
      throw error;
    }
  };

  companyName = async (user_id: string): Promise<ICompany | null> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      if (!userData) throw new Error("No userData exists");
      const refferalCode = userData?.refferalCode;
      const companyDetails: ICompany | null = await this.companyModel.findOne({
        refferalCode: refferalCode,
      });
      return companyDetails;
    } catch (error) {
      throw error;
    }
  };
}
export default CompanyRepository;
