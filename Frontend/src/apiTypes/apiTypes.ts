import { ChangeEvent } from "react";
import { Socket } from "socket.io-client";

export interface UserData{
    _id?:string
    firstName:string;
    lastName?:string;
    email:string;
    phone?:string;
    profileImage?:string
    password?:string;
    user_id:string;
    isBlocked:boolean;
    address?:string;
    state?:string;
    city?:string
    companyId?:string
    refferalCode?:string
    position?:string;
    createdAt?:Date
}

export interface AdminData{
  firstName:string;
  lastName?:string;
  email:string;
  phone?:string;
  profileImage?:string
  password?:string;
  admin_id:string;
  isBlocked:boolean;
  address?:string;
  state?:string;
  city?:string;
  companyId?:string;
  position?:string;
}

export interface Project {
    _id: string;
    name: string;
    description: string;
    members: Member[];
    latestMessage?:Message
  }
  export interface INotification{
    _id:string;
    user_id:string;
    assignedUserId:string;
    taskId:string;
    isRead:boolean,
    createdAt:Date,
    message:string
}

export interface NotificationsProps {
  notifications: INotification[];
}
  
export interface Member {
    _id?:string
    email: string;
    role: "Admin" | "Member";
  }

export interface CompanyMember {
  _id?:string;
  email:string;
  role:"Admin"|"Member"
  status:"pending",
  invitedAt:Date
}
  
export interface ProjectSidebarProps {
    initialProjects?: Project[];
  }
  export interface ChatRightbarProps {
    selectedProject: Project|null;
    fetchProjects:()=>Promise<void>
  }
  export interface UserManagementRightProps {
    selectedProject: Project|null;
    setSelectedProject:React.Dispatch<React.SetStateAction<Project | null>>;
    fetchProjects:()=>Promise<void>
  } 
  export interface MeetingProps {
    selectedProject: Project|null;
  }
export interface ProjectChatbarProps {
    projects: Project[];
    setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
    onProjectSelect: (project: Project) => void
}
export interface MeetingBarProps {
  projects: Project[];
  setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
  onProjectSelect: (project: Project) => void
}
export interface UserManagementProps {
  projects: Project[];
  setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
  onProjectSelect: (project: Project) => void;
}
export interface DraggableTaskProps {
  task: Task;
  onClick: (taskId: Task) => void;
}
export interface ProjectHomebarProps {
  projects: Project[];
  setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
}
export interface DashBoardProps{
  socket:Socket|null
}
export interface RightComponentProps {
  onTabSelect: (tab: 'dashboard' | 'tasks' | 'notifications') => void;
  socket:Socket|null
}
export interface Company{
  _id?:string;
  companyName:string;
  description:string;
  members:Member[]
}

// apiTypes/apiTypes.ts

export interface IMeeting {
  _id:string
  user_id: string;
  startTime?: Date; 
  endTime?: Date;
  duration?: number; 
  projectId: string;
  MeetingTime: Date; 
  roomId: string; 
  members:Member[]
  status?: 'active' | 'completed' | 'cancelled';
}
export interface Message {
  _id? : string;
  text: string;
  sentAt: string | Date; // Sent timestamp
  senderId: string; // Sender object
  senderRole:"Admin"|"User"
  senderName:string;
  read?: boolean; // If the message has been read
  time?: string; // Time message was sent (formatted as "HH:MM")
  date: string; // Date of the message (formatted as "DD-MM-YYYY")
  projectId: string; 
  sent:boolean;
  imageFile?: {
    name: string; 
    type: string;
    data?:string;
    url?: string; 
  };
}

export interface Comments{
  _id?:string;
  user:string;
  text:string;
  createdAt:Date
}
  export interface Task {
    _id: string;
    taskName: string;
    description: string;
    member: string;
    projectId: string;
    status: string;
    deadline: string;
    taskImage: string;
    user_id: string;
    acceptanceStatus?:"unAssigned" | "active" | "reAssigned";
    projectDetails:Project
    comments:Comments[]
  }

export type TaskModalProps = {
    task: Task|undefined; // Assuming Task is a valid TypeScript type
    userInfo:UserData|null; // Adjust type based on your actual userInfo structure
    toggleTaskDetailsModal: () => void;
    handleProjectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    fetchProjects:()=>void;
    handleMembersChange:(event: React.ChangeEvent<HTMLSelectElement>)=>void;
    handleFileChange:(event: React.ChangeEvent<HTMLInputElement>)=>void
    handleSubmit:(e: React.FormEvent) => Promise<void>
    projects:Project[]
    fetchProjectMembers:(projectId: string) => Promise<void>
    assignees:Member[]
  };

 export interface Tasks {
    pendingTask: Task[];
    inProgress: Task[];
    done: Task[];
  }
  