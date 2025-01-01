import { IAdmin, IUser} from "./commonInterface";
import Stripe from "stripe";
export interface IAdminService {
    login(email:string,password:string):Promise<{adminData:IAdmin,adminToken:string,adminRefreshToken:string}>
    register(adminData:IAdmin):Promise<void>;
    otpVerification(enteredOTP:string):Promise<IAdmin>
    resendOTP():Promise<void>
    verifyGoogleAuth(token: string): Promise<{adminData:IAdmin,adminToken:string,adminRefreshToken:string}>;
    resetPassword(email:string):Promise<void>
    confirmResetPassword(token:string,password:string):Promise<void>
    validateToken(token:string):Promise<void>
    userBlock(user_id:string):Promise<IUser>
    userUnBlock(user_id:string):Promise<IUser>
    updateAdmin(admin_id:string,admin:IAdmin):Promise<IAdmin|null>
    adminProfilePicture(admin_id:string,profileURL:string):Promise<string>
    payment(admin_id:string,subscription:string):Promise<string>
    handleWebHook(event:Stripe.Event):Promise<void>
}