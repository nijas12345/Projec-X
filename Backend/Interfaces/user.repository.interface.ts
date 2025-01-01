import { IUser } from "./commonInterface";

export interface IUserRepository{
    findByEmail(email:string):Promise<IUser|null>;
    register(userData:IUser):Promise<IUser>
    login(email:string):Promise<IUser|null>
    verifyGoogleAuth(email:string):Promise<IUser|null>
    resetPassword(email:string):Promise<IUser|null>
    confirmResetPassword(email:string,password:string):Promise<void>
    updateUser(user_id:string,user:IUser):Promise<IUser|null> 
    profilePicture(user_id:string,profileURL:string):Promise<string> 
    addRefferalCode(user_id:string,refferalCode:string):Promise<IUser|null>
}