import { Model } from "mongoose";
import { IAdmin, IPayment, IUser } from "../Interfaces/commonInterface";
import { v4 as uuidv4 } from "uuid";
import { IAdminRepository } from "../Interfaces/admin.repository.interface";
import path from "path";
import fs, { promises as fsPromises } from "fs";

class AdminRepository implements IAdminRepository {
  private adminModel = Model<IAdmin>;
  private userModel = Model<IUser>;
  private paymentModel = Model<IPayment>;
  constructor(
    adminModel: Model<IAdmin>,
    userModel: Model<IUser>,
    paymentModel: Model<IPayment>
  ) {
    this.adminModel = adminModel;
    this.userModel = userModel;
    this.paymentModel = paymentModel;
  }
  findByEmail = async (email: string): Promise<IAdmin | null> => {
    try {
      return await this.adminModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  };
  register = async (adminData: IAdmin): Promise<IAdmin> => {
    try {
      return await this.adminModel.create(adminData);
    } catch (error) {
      throw error;
    }
  };
  login = async (email: string): Promise<IAdmin | null> => {
    try {
      const admin: IAdmin | null = await this.adminModel.findOne({
        email: email,
      });
      if (admin) {
        let adminWithoutId: IAdmin | null = await this.adminModel.findOne(
          { _id: admin._id },
          { _id: 0 }
        );
        return adminWithoutId;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };
  verifyGoogleAuth = async (email: string): Promise<IAdmin | null> => {
    try {
      const admin = await this.adminModel.findOne({ email: email });
      console.log("hai", admin);
      if (!admin) {
        let user_id = uuidv4();
        let adminData = {
          firstName: email.split("@")[0],
          email: email,
          user_id: user_id,
        };

        let newAdmin = await this.adminModel.create(adminData);
        let adminWithoutId = await this.adminModel.findOne(
          { _id: newAdmin._id },
          { _id: 0 }
        );
        console.log("withour", adminWithoutId);
        return adminWithoutId;
      }
      let adminWithoutId = await this.adminModel.findOne(
        { _id: admin._id },
        { _id: 0 }
      );
      return adminWithoutId;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  resetPassword = async (email: string): Promise<IAdmin | null> => {
    try {
      return await this.adminModel.findOne({ email: email });
    } catch (error) {
      throw error;
    }
  };
  confirmResetPassword = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      await this.adminModel.findOneAndUpdate(
        { email: email },
        {
          password: password,
        }
      );
    } catch (error) {
      throw error;
    }
  };
  adminProfilePicture = async (
    admin_id: string,
    profileURL: string
  ): Promise<string> => {
    try {
      console.log("admin_id", admin_id);

      const admin: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });

      if (admin?.profileImage) {
        const profileImagePath = path.join(
          __dirname,
          "../uploads",
          admin.profileImage
        );
        console.log(profileImagePath);
        try {
          if (fs.existsSync(profileImagePath)) {
            await fsPromises.unlink(profileImagePath);
            console.log("File deleted successfully");
          } else {
            console.log("file not found");
          }
        } catch (error) {
          throw error;
        }
      }
      let profileurl = `http://localhost:8000/${profileURL}`;
      const adminData: IAdmin | null = await this.adminModel.findOneAndUpdate(
        { admin_id: admin_id },
        { profileImage: profileurl },
        { new: true }
      );
      console.log(adminData);

      if (adminData) {
        return adminData.profileImage;
      } else {
        throw new Error("Fetching of user image failed");
      }
    } catch (error) {
      throw error;
    }
  };
  userBlock = async (user_id: string): Promise<IUser | null> => {
    try {
      const userData: IUser | null = await this.userModel.findOneAndUpdate(
        { user_id: user_id },
        {
          isBlocked: true,
        },
        { new: true }
      );
      console.log(userData);

      return userData;
    } catch (error) {
      throw error;
    }
  };
  userUnBlock = async (user_id: string): Promise<IUser | null> => {
    try {
      const userData: IUser | null = await this.userModel.findOneAndUpdate(
        { user_id: user_id },
        {
          isBlocked: false,
        },
        { new: true }
      );
      return userData;
    } catch (error) {
      throw error;
    }
  };
  updateAdmin = async (
    admin_id: string,
    admin: IAdmin
  ): Promise<IAdmin | null> => {
    try {
      let adminData: IAdmin | null = await this.adminModel.findOneAndUpdate(
        { admin_id: admin_id },
        {
          firstName: admin.firstName,
          lastName: admin.lastName,
          phone: admin.phone,
          address: admin.address,
          position: admin.position,
          city: admin.city,
          state: admin.state,
        }
      );
      let updatedUser: IAdmin | null = await this.adminModel.findOne({
        admin_id: admin_id,
      });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };
  payment = async (
    admin_id: string,
    subscription: string,
    amount: number,
    customer: string
  ): Promise<void> => {
    try {
      const newPayment = await this.paymentModel.create({
        admin_id,
        subscription,
        amount,
        status: "active",
        customer,
      });
      console.log("newPayment", newPayment);
    } catch (error) {
      throw error;
    }
  };

  updatePaymentStatus = async (customerId: string): Promise<void> => {
    try {
      const paymentData = await this.paymentModel.findOneAndUpdate(
        { customer: customerId, status: "active" },
        {
          status: "cancelled",
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  };
  activeSubscription = async (admin_id: string): Promise<void> => {
    try {
      const paymentData: IPayment | null = await this.paymentModel.findOne({
        status: "active",
        admin_id: admin_id,
      });
      if (paymentData) throw new Error("You have already a subscription plan");
    } catch (error) {
      throw error;
    }
  };
}

export default AdminRepository;
