import cloudinary from "../Config/cloudinary_config";
import { IChatRepository } from "../Interfaces/chat.repository.interface";
import { IChatService } from "../Interfaces/chat.service.interface";
import { IMeeting, IMessage, IProject } from "../Interfaces/commonInterface";

class ChatServices implements IChatService {
  private chatRepository: IChatRepository;
  constructor(chatRepository: IChatRepository) {
    this.chatRepository = chatRepository;
  }
  getChats = async (
    user_id: string,
    projectId: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<IMessage[] | null> => {
    try {
      const chats: IMessage[] | null = await this.chatRepository.getChats(
        user_id,
        projectId,
        pageNumber,
        limitNumber
      );
      return chats;
    } catch (error) {
      throw error;
    }
  };
  getAdminChats = async (
    user_id: string,
    projectId: string,
    pageNumber: number,
    limitNumber: number
  ): Promise<IMessage[] | null> => {
    try {
      const chats: IMessage[] | null = await this.chatRepository.getChats(
        user_id,
        projectId,
        pageNumber,
        limitNumber
      );
      return chats;
    } catch (error) {
      throw error;
    }
  };

  saveChats = async (messageDetails: IMessage): Promise<IMessage> => {
    try {
      const chats: IMessage = await this.chatRepository.saveChats(
        messageDetails
      );
      return chats;
    } catch (error) {
      throw error;
    }
  };
  saveFiles = async (messageWithFile: IMessage): Promise<IMessage> => {
    try {
      // const data = messageWithFile.imageFile?.data
      // const name = messageWithFile.imageFile?.name
      //    const uploadResult = await cloudinary.uploader.upload(data, {
      //                  folder: "project_files",
      //                  resource_type: "auto",
      //                  public_id: name,
      //                });
      const chats: IMessage = await this.chatRepository.saveFiles(
        messageWithFile
      );
      console.log("chats", chats);

      return chats;
    } catch (error) {
      throw error;
    }
  };
  getMeetings = async (user_id: string): Promise<IProject[]> => {
    try {
      const projectData: IProject[] = await this.chatRepository.getMeetings(
        user_id
      );
      return projectData;
    } catch (error) {
      throw error;
    }
  };
  getAdminMeetings = async (admin_id: string): Promise<IProject[]> => {
    try {
      const projectData: IProject[] =
        await this.chatRepository.getAdminMeetings(admin_id);
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
      return await this.chatRepository.scheduleMeetings(
        admin_id,
        meetingTime,
        projectId,
        roomId
      );
    } catch (error) {
      throw error;
    }
  };
  fetchMeetings = async (
    user_id: string,
    projectId: string
  ): Promise<IMeeting[]> => {
    try {
      const meetingData: IMeeting[] = await this.chatRepository.fetchMeetings(
        user_id,
        projectId
      );
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
      const meetingData: IMeeting[] =
        await this.chatRepository.AdminfetchMeetings(admin_id, projectId);
      return meetingData;
    } catch (error) {
      throw error;
    }
  };
  updateMeetingStatus = async (
    meetingId: string,
    status: string
  ): Promise<IMeeting> => {
    try {
      console.log("jaslkdfjaslkdfjldjasldfjsal;d");

      const meetingData: IMeeting | null =
        await this.chatRepository.updateMeetingStatus(meetingId, status);
      if (!meetingData) throw new Error("No meeting Data found");
      return meetingData;
    } catch (error) {
      throw error;
    }
  };
}

export default ChatServices;
