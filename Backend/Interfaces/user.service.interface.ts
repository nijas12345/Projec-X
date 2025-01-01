import { IUser} from "./commonInterface";

export interface IUserService {
        login(email:string,password:string):Promise<{userData:IUser,userToken:string,refreshToken:string}>
    register(userData:IUser):Promise<void>;
    otpVerification(enteredOTP:string):Promise<IUser>
    resendOTP():Promise<void>
    verifyGoogleAuth(token: string): Promise<{userData:IUser,userToken:string,refreshToken:string}>;
    resetPassword(email:string):Promise<void>
    confirmResetPassword(token:string,password:string):Promise<void>
    validateToken(token:string):Promise<void>
    updateUser(user_id:string,user:IUser):Promise<IUser|null>
    profilePicture(user_id:string,profileURL:string):Promise<string>
    addRefferalCode(user_id:string,refferalCode:string):Promise<IUser|null>
}