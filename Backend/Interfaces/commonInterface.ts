import mongoose from "mongoose"
export interface IUser{
    _id?:mongoose.Types.ObjectId;
    user_id:string;
    firstName:string;
    lastName?:string
    email:string;
    password?:string;
    profileImage:string;
    phone?:string;
    isBlocked:boolean;
    address:string;
    position:string;
    city:string
    companyId?:string;
    refferalCode?:string|null
    state:string;
    createdAt?:Date
}

export interface IAdmin{
    _id?:mongoose.Types.ObjectId;
    admin_id:string;
    firstName:string;
    lastName?:string
    email:string;
    password?:string;
    profileImage:string;
    phone?:string;
    address:string;
    position:string;
    city:string
    state:string;
    companyId:string
    
}
export interface IPayment {
    admin_id: string;
    subscription: string; 
    amount: number;     
    status: "active" | "expired" | "pending" | "canceled"; 
    created_at: Date; 
    customer:string
  }
  

export interface IMember{
    _id?:mongoose.Types.ObjectId;
    email:string
    role:"Admin" | "Member"
}
export interface ICompanyMember{
    _id?:mongoose.Types.ObjectId;
    email:string
    role:"Admin" | "Member"
    status:"pending",
    invitedAt:Date
}

export interface ICompany{
    _id:mongoose.Types.ObjectId;
    companyName:string;
    description:string;
    refferalCode:string;
    members:ICompanyMember[]
}

export interface IProject{
    _id?:mongoose.Types.ObjectId;
    admin_id:string;
    name:string;
    description:string;
    createdAt:Date
    members:Array<IMember>;
    status:String;
    address:String;
    state:String;
    city:String;
    position:String;
}


export interface IMeeting {
   admin_id: string;
  startTime?: Date; 
  endTime?: Date;
  duration?: number; 
  projectId: string;
  MeetingTime: Date; 
  roomId: string; 
  members:IMember[]
  status?: 'active' | 'completed' | 'cancelled';
}


export interface Projects{
    _id?:mongoose.Types.ObjectId;
    user_id:string;
    name:string;
    description:string;
    createdAt:Date
    latestMessage?:LatestMessage | null
    members:Array<IMember>
}

export interface IComments{
    _id:string;
    user:string;
    text:string;
    createdAt:Date;
}

export interface ITask{
   _id?:mongoose.Types.ObjectId;
   admin_id:string;
   taskName:string;
   description:string;
   member:string;
   projectId:mongoose.Types.ObjectId;
   taskImage?:string;
   deadline:string;
   status?: "pending" | "inProgress" | "completed";
   acceptanceStatus?:"unAssigned" | "active" | "reAssigned" 
   comments:Array<IComments>
}

export interface INotification{
    _id:mongoose.Types.ObjectId;
    admin_id:string;
    assignedUserId:string;
    taskId:mongoose.Types.ObjectId;
    isRead:boolean,
    createdAt:Date,
    message:string
    notificationType:"Admin"|"User"
}

export interface LatestMessage {
    _id: string; // Or `ObjectId` if you're using Mongoose's ObjectId type
    projectId: string; // Project ID as a reference
    senderId: string; // Unique ID of the sender
    senderName: string; // Name of the sender
    text: string; // Message content
    sentAt: Date; // ISO date when the message was sent
    time: string; // Time as a string
    date: string; // Date as a string
    sent: boolean; // Status of the message
    readBy: string[]; // List of users who have read the message
    [key: string]: any; // Additional dynamic properties
  }
  
export interface IWorkLog{
    _id?:mongoose.Types.ObjectId;
    user_id:string;
    date:Date;
    clockIn:Date;
    clockOut:Date;
    breakDuration:number;
    breakStart:Date;
    breakEnd:Date;
    workDuration:number;
    isClockedIn:boolean;
    isOnBreak:boolean;
}

export interface Statistics{
    _id:mongoose.Types.ObjectId;
    date:Date,
    clockIn:Date,
    clockOut:Date,
    workDuration:number
}


export interface IMessage {
    _id?: mongoose.Types.ObjectId; 
    text: string; 
    sentAt: Date; 
    senderId: string; 
    senderRole: 'Admin' | 'User'; 
    senderName: string; 
    readBy: mongoose.Types.ObjectId[]; 
    time?: string; 
    date: string; 
    projectId: mongoose.Types.ObjectId; 
    sent: boolean;
    imageFile?: {
      url: string; 
      name: string; 
      data:string;
      type: string 
    };
  }
  
  




