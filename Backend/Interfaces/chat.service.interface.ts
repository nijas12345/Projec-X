import { IMeeting, IMessage, IProject} from "./commonInterface"                                   
export interface IChatService {
    getChats(user_id:string,projectId:string,pageNumber:number,limitNumber:number):Promise<IMessage[]|null>
    getAdminChats(admin_id:string,projectId:string,pageNumber:number,limitNumber:number):Promise<IMessage[]|null>
    saveChats(messageDetails:IMessage):Promise<IMessage>
    saveFiles(messageDetails:IMessage):Promise<IMessage>
    getMeetings(user_id:string):Promise<IProject[]>
    getAdminMeetings(admin_id:string):Promise<IProject[]>
    scheduleMeetings(admin_id:string,meetingTime:Date,projectId:string,roomId:string):Promise<IMeeting>
    fetchMeetings(user_id:string,projectId:string):Promise<IMeeting[]>
    AdminfetchMeetings(admin_id:string,projectId:string):Promise<IMeeting[]> 
    updateMeetingStatus(meetingId:string,status:string):Promise<IMeeting>    
}