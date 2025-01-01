import mongoose, { Model } from "mongoose";
import { IChatRepository } from "../Interfaces/chat.repository.interface";
import {
  IAdmin,
  IMeeting,
  IMember,
  IMessage,
  INotification,
  IProject,
  IUser,
} from "../Interfaces/commonInterface";

class ChatRepository implements IChatRepository {
  private adminModel = Model<IAdmin>;
  private userModel = Model<IUser>;
  private chatModel = Model<IMessage>;
  private projectModel = Model<IProject>;
  private meetingModel = Model<IMeeting>;
  constructor(
    adminModel: Model<IAdmin>,
    userModel: Model<IUser>,
    chatModel: Model<IMessage>,
    projectModel: Model<IProject>,
    meetingModel: Model<IMeeting>
  ) {
    this.adminModel = adminModel;
    this.userModel = userModel;
    this.chatModel = chatModel;
    this.projectModel = projectModel;
    this.meetingModel = meetingModel;
  }
  getChats = async (
    user_id: string,
    projectId: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<IMessage[] | null> => {
    try {
      const chatData: IMessage[] | null = await this.chatModel
        .find({ projectId: projectId })
        .sort({ _id: -1 }) // Get newest chats first
        .skip((pageNumber - 1) * limitNumber) // Pagination logic
        .limit(limitNumber); // Use limitNumber parameter

      const sortedChatData = chatData ? chatData.reverse() : null; // Reverse to chronological order
      return sortedChatData;
    } catch (error) {
      throw error;
    }
  };
  getAdminChats = async (
    admin_id: string,
    projectId: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<IMessage[] | null> => {
    try {
      const chatData: IMessage[] | null = await this.chatModel
        .find({ projectId: projectId })
        .sort({ _id: -1 }) // Get newest chats first
        .skip((pageNumber - 1) * limitNumber) // Pagination logic
        .limit(limitNumber); // Use limitNumber parameter

      const sortedChatData = chatData ? chatData.reverse() : null; // Reverse to chronological order
      return sortedChatData;
    } catch (error) {
      throw error;
    }
  };
  saveChats = async (messageDetails: IMessage): Promise<IMessage> => {
    try {
      const projectId = messageDetails.projectId;
      const savedMessage = await this.chatModel.create(messageDetails);
      return savedMessage;
    } catch (error) {
      throw error;
    }
  };
  saveFiles = async (messageWithFile: IMessage): Promise<IMessage> => {
    try {
      delete messageWithFile._id;
      const projectId = messageWithFile.projectId;
      console.log("message", messageWithFile);

      const savedMessage = await this.chatModel.create(messageWithFile);
      console.log("savedMessage", savedMessage);

      return savedMessage;
    } catch (error) {
      throw error;
    }
  };
  getMeetings = async (user_id: string): Promise<IProject[]> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      if (!userData) throw new Error("No user Data found");
      const email: string = userData.email;
      const projectData: IProject[] = await this.projectModel.find({
        "members.email": email,
      });
      console.log(projectData);

      return projectData;
    } catch (error) {
      throw error;
    }
  };
  getAdminMeetings = async (admin_id: string): Promise<IProject[]> => {
    try {
      const projectData: IProject[] = await this.projectModel.find({
        admin_id: admin_id,
      });
      console.log(projectData);
      return projectData;
    } catch (error) {
      throw error;
    }
  };
  scheduleMeetings = async (
    admin_id: string,
    meetingTime: Date,
    projectId: string,
    roomId: string
  ): Promise<IMeeting> => {
    try {
      const projectData: IProject | null = await this.projectModel.findById(
        projectId
      );
      if (!projectData) {
        throw new Error("No project Data");
      }
      const members: IMember[] = projectData.members.map((member) => ({
        email: member.email,
        role: "Member",
      }));
      const adminData: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      if (!adminData) throw new Error("No Admin Data");
      console.log("members", members);

      const meetingData: IMeeting = {
        admin_id: admin_id,
        projectId: projectId,
        MeetingTime: meetingTime,
        roomId: roomId,
        members: members,
      };
      const meeting: IMeeting | null = await this.meetingModel.create(
        meetingData
      );
      console.log(meeting);

      if (!meeting) throw new Error("No meeting created");
      return meeting;
    } catch (error) {
      throw error;
    }
  };
  fetchMeetings = async (
    user_id: string,
    projectId: string
  ): Promise<IMeeting[]> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      if (!userData) {
        throw new Error("No User Data");
      }
      const userEmail: string = userData.email;
      const meetingData = (await this.meetingModel.find({
        "members.email": userEmail,
        projectId: projectId,
      })) as IMeeting[];
      if (!meetingData) throw new Error("No meeting data");
      return meetingData;
    } catch (error) {
      throw error;
    }
  };
  AdminfetchMeetings = async (
    admin_id: string,
    projectId: string
  ): Promise<IMeeting[]> => {
    try {
      const meeting = await this.meetingModel.find();
      console.log("mettng", meeting);

      const meetingData = (await this.meetingModel.find({
        admin_id: admin_id,
        projectId: projectId,
      })) as IMeeting[];
      console.log("meeting", meetingData);

      if (!meetingData) throw new Error("No meeting data");
      return meetingData;
    } catch (error) {
      throw error;
    }
  };
  updateMeetingStatus = async (
    meetingId: string,
    status: string
  ): Promise<IMeeting | null> => {
    try {
      const meetingData: IMeeting | null =
        await this.meetingModel.findByIdAndUpdate(
          meetingId,
          {
            status: status,
          },
          { new: true }
        );
      console.log("meeting", meetingData);

      return meetingData;
    } catch (error) {
      throw error;
    }
  };
}

export default ChatRepository;
