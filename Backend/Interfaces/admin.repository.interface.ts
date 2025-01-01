import { IAdmin, IPayment, IUser } from "./commonInterface";

export interface IAdminRepository{
    findByEmail(email:string):Promise<IAdmin|null>;
    register(adminData:IAdmin):Promise<IAdmin>
    login(email:string):Promise<IAdmin|null>
    verifyGoogleAuth(email:string):Promise<IAdmin|null>
    resetPassword(email:string):Promise<IAdmin|null>
    confirmResetPassword(email:string,password:string):Promise<void>
    adminProfilePicture(admin_id:string,profileURL:string):Promise<string> 
    userBlock(user_id:string):Promise<IUser|null>
    userUnBlock(user_id:string):Promise<IUser|null>
    updateAdmin(admin_id:string,admin:IAdmin):Promise<IAdmin|null>
    activeSubscription(admin_id:string):Promise<void>
    payment(
        admin_id: string,
        subscription: string,
        amount: number,
        customer:string
      ): Promise<void>;       
    updatePaymentStatus(customer:string):Promise<void>
}