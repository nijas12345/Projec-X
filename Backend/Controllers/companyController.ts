import { Request, Response } from "express";
import HTTP_statusCode from "../Enums/httpStatusCode";
import {
  ICompany,
  ICompanyMember,
  IMember,
  IProject,
} from "../Interfaces/commonInterface";
import { ICompanyService } from "../Interfaces/company.service.interface";
import { HttpStatusCode } from "axios";
import { log } from "node:console";

class CompanyController {
  private companyService: ICompanyService;
  constructor(companyService: ICompanyService) {
    this.companyService = companyService;
  }
  companyDetails = async (req: Request, res: Response) => {
    try {
      const companyData = req.body as ICompany;
      const admin_id = req.admin_id as string;
      const serviceResponse = await this.companyService.companyDetails(
        companyData,
        admin_id
      );
      console.log("service", serviceResponse);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  companyMembers = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const serviceResponse = await this.companyService.companyMembers(
        admin_id
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  searchMembers = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const searchQuery = req.body.searchQuery as string
      const selectedProject = req.body.selectedProject as IProject|null
      const serviceResponse = await this.companyService.searchMembers(
        admin_id,
        searchQuery,
        selectedProject
      );
      console.log("service",serviceResponse);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  companyData = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const serviceResponse = await this.companyService.companyData(admin_id);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  invitationUsers = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const members: IMember[] = req.body.members;
      const serviceResponse: ICompanyMember[] =
      await this.companyService.inviationUsers(admin_id, members);
      console.log("service");
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  inviteUser = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const email: string = req.body.email;
      await this.companyService.inviteUser(admin_id, email);
      res.status(HttpStatusCode.Ok).send();
    } catch (error) {
      console.log(error);
    }
  };
  companyInfo = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const serviceResponse = await this.companyService.companyInfo(admin_id);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  companyName = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.companyService.companyName(user_id);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
}

export default CompanyController;
