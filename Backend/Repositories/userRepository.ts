import { Model } from "mongoose";
import { IUserRepository } from "../Interfaces/user.repository.interface";
import { ICompany, IUser } from "../Interfaces/commonInterface";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs, { promises as fsPromises } from "fs";

class UserRepository implements IUserRepository {
  private userModel = Model<IUser>;
  private companyModel = Model<ICompany>;
  constructor(userModel: Model<IUser>, companyModel: Model<ICompany>) {
    this.userModel = userModel;
    this.companyModel = companyModel;
  }
  findByEmail = async (email: string): Promise<IUser | null> => {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  };
  register = async (userData: IUser): Promise<IUser> => {
    try {
      if (userData.refferalCode) {
        const companyData: ICompany | null =
          await this.companyModel.findOneAndUpdate(
            {
              refferalCode: userData.refferalCode, // Match the referral code
              "members.email": userData.email, // Match the email within the members array
            },
            {
              $set: { "members.$.status": "joined" }, // Update the status of the matching member
            },
            { new: true } // Return the updated document
          );
        if (!companyData) throw new Error("No company exist");
      }
      return await this.userModel.create(userData);
    } catch (error) {
      throw error;
    }
  };
  login = async (email: string): Promise<IUser | null> => {
    try {
      const user: IUser | null = await this.userModel.findOne({ email: email });
      if (user) {
        let userWithoutId: IUser | null = await this.userModel.findOne(
          { _id: user._id },
          { _id: 0 }
        );
        return userWithoutId;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };
  verifyGoogleAuth = async (email: string): Promise<IUser | null> => {
    try {
      const user = await this.userModel.findOne({ email: email });
      console.log("hai", user);
      if (!user) {
        let user_id = uuidv4();
        let userData = {
          firstName: email.split("@")[0],
          email: email,
          user_id: user_id,
        };

        let newUser = await this.userModel.create(userData);
        let userWithoutId = await this.userModel.findOne(
          { _id: newUser._id },
          { _id: 0 }
        );
        console.log("withour", userWithoutId);
        return userWithoutId;
      }
      let userWithoutId = await this.userModel.findOne(
        { _id: user._id },
        { _id: 0 }
      );
      return userWithoutId;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  resetPassword = async (email: string): Promise<IUser | null> => {
    try {
      return await this.userModel.findOne({ email: email });
    } catch (error) {
      throw error;
    }
  };
  confirmResetPassword = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      await this.userModel.findOneAndUpdate(
        { email: email },
        {
          password: password,
        }
      );
    } catch (error) {
      throw error;
    }
  };
  updateUser = async (user_id: string, user: IUser): Promise<IUser | null> => {
    try {
      let userData: IUser | null = await this.userModel.findOneAndUpdate(
        { user_id: user_id },
        {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          position: user.position,
          companyName: user.city,
          state: user.state,
        }
      );
      let updatedUser: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };
  profilePicture = async (
    user_id: string,
    profileURL: string
  ): Promise<string> => {
    try {
      console.log("user_id", user_id);

      const user: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      console.log("user", user);

      if (user?.profileImage) {
        const profileImagePath = path.join(
          __dirname,
          "../uploads",
          user.profileImage
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
      let profileurl = profileURL
      const userData: IUser | null = await this.userModel.findOneAndUpdate(
        { user_id: user_id },
        { profileImage: profileurl },
        { new: true }
      );

      if (userData) {
        return userData.profileImage;
      } else {
        throw new Error("Fetching of user image failed");
      }
    } catch (error) {
      throw error;
    }
  };
  addRefferalCode = async (
    user_id: string,
    refferalCode: string
  ): Promise<IUser | null> => {
    try {
      const companyData: ICompany | null = await this.companyModel.findOne({
        refferalCode: refferalCode,
      });
      if (!companyData)
        throw new Error(
          "Your Refferal Code is wrong. Please Enter the correct Refferal Code"
        );
      const userData: IUser | null = await this.userModel.findOneAndUpdate(
        { user_id: user_id },
        {
          refferalCode: refferalCode,
          companyId: companyData._id,
        },
        { new: true }
      );
      if (!userData) throw new Error("No user Data");
      const company: ICompany | null = await this.companyModel.findOneAndUpdate(
        {
          "members.email": userData.email,
        },
        {
          $set: { "members.$.status": "joined" },
        },
        { new: true }
      );
      if (!companyData) throw new Error("No company exist");
      const userWithoutId = await this.userModel.findOne(
        { _id: userData._id },
        { _id: 0, companyId: 0 } // Exclude _id and companyId
      );
      return userWithoutId;
    } catch (error) {
      throw error;
    }
  };
  userIsBlocked = async (user_id: string): Promise<boolean> => {
    try {
      const userData: IUser | null = await this.userModel.findOne({
        user_id: user_id,
      });
      if (!userData) throw new Error("No user Data");
      return userData.isBlocked;
    } catch (error) {
      throw error;
    }
  };
}

export default UserRepository;
