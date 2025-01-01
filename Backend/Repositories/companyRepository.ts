import { Model } from "mongoose";
import {
  IAdmin,
  ICompany,
  ICompanyMember,
  IMember,
  IProject,
  IUser,
} from "../Interfaces/commonInterface";
import { ICompanyRepository } from "../Interfaces/company.repository.interface";

class CompanyRepository implements ICompanyRepository {
  private adminModel = Model<IAdmin>;
  private userModel = Model<IUser>;
  private companyModel = Model<ICompany>;
  private projectModel = Model<IProject>;
  constructor(
    adminModel: Model<IAdmin>,
    userModel: Model<IUser>,
    companyModel: Model<ICompany>,
    projectModel: Model<IProject>
  ) {
    this.companyModel = companyModel;
    this.adminModel = adminModel;
    this.userModel = userModel;
    this.projectModel = projectModel;
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
      return companyData.members;
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
      const companyMembers: ICompanyMember[] = updatedCompany.members;
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
  }> => {
    try {
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
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
      return { companyName, userCount, projectCount };
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
