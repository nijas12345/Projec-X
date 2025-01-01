import { Request, Response } from "express";
import HTTP_statusCode from "../Enums/httpStatusCode";
import { IChatService } from "../Interfaces/chat.service.interface";
import { HttpStatusCode } from "axios";

class ChatController {
  private chatService: IChatService;
  constructor(chatService: IChatService) {
    this.chatService = chatService;
  }
  getChats = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const projectId = req.params.projectId;
      const pageNumber: number = parseInt(
        (req.query.page as string) || "1",
        10
      );
      const limitNumber: number = parseInt(
        (req.query.limit as string) || "5",
        10
      );
      const serviceResponse = await this.chatService.getChats(
        user_id,
        projectId,
        pageNumber,
        limitNumber
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  getAdminChats = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const projectId = req.params.projectId;
      const pageNumber: number = parseInt(
        (req.query.page as string) || "1",
        10
      );
      const limitNumber: number = parseInt(
        (req.query.limit as string) || "5",
        10
      );
      const serviceResponse = await this.chatService.getChats(
        admin_id,
        projectId,
        pageNumber,
        limitNumber
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  getMeetings = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.chatService.getMeetings(user_id);
      console.log("service", serviceResponse);

      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  getAdminMeetings = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const serviceResponse = await this.chatService.getAdminMeetings(admin_id);
      console.log("service", serviceResponse);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  scheduleMeeting = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const { meetingTime, projectId, roomId } = req.body;
      const serviceResponse = await this.chatService.scheduleMeetings(
        admin_id,
        meetingTime,
        projectId,
        roomId
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  fetchMeetings = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const { projectId } = req.body;
      const serviceResponse = await this.chatService.fetchMeetings(
        user_id,
        projectId
      );
      console.log(serviceResponse);
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  AdminfetchMeetings = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const { projectId } = req.body;
      const serviceResponse = await this.chatService.AdminfetchMeetings(
        admin_id,
        projectId
      );

      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  updateMeetingStatus = async (req: Request, res: Response) => {
    try {
      const { meetingId, status } = req.body;
      console.log(meetingId, status);
      const serviceResponse = await this.chatService.updateMeetingStatus(
        meetingId,
        status
      );
      res.status(HttpStatusCode.Ok).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
}

export default ChatController;
