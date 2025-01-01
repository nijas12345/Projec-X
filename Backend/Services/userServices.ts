import { IUser } from "../Interfaces/commonInterface";
import { IUserService } from "../Interfaces/user.service.interface";
import { IUserRepository } from "../Interfaces/user.repository.interface";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { sendOTPmail, sendResetPasswordLink } from "../Config/email_config";
import {
  createToken,
  createRefreshToken,
  verifyResetPasswordToken,
} from "../Config/jwt_config";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(`${process.env.Google_clientID}`);
class UserServices implements IUserService {
  private userRepository: IUserRepository;
  private userData: IUser | null = null;
  private otp: string | null = null;
  private expiryOTP_time: Date | null = null;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }
  login = async (
    email: string,
    password: string
  ): Promise<{ userData: IUser; userToken: string; refreshToken: string }> => {
    try {
      const userData = await this.userRepository.login(email);
      if (!userData) throw new Error("Email not found");
      const comparePassword = await bcrypt.compare(
        password,
        userData.password as string
      );
      if (!comparePassword) throw new Error("Wrong password");
      if (userData.isBlocked) throw new Error("User is blocked");
      const userToken = createToken(userData.user_id as string, "USER");
      const refreshToken = createRefreshToken(
        userData.user_id as string,
        "USER"
      );
      return { userToken, refreshToken, userData };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  register = async (userData: IUser): Promise<void> => {
    try {
      const alreadyExists: IUser | null = await this.userRepository.findByEmail(
        userData.email
      );
      if (alreadyExists) {
        throw new Error("Email already exists");
      }
      this.userData = userData;
      const generatedOtp: string = Math.floor(
        1000 + Math.random() * 9000
      ).toString();
      this.otp = generatedOtp;
      console.log(`generatedOTp${generatedOtp}`);
      const isMailSended = await sendOTPmail(userData.email, generatedOtp);
      if (!isMailSended) {
        throw new Error("Email not send");
      }
      const OTP_createdTime = new Date();
      this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
      return;
    } catch (error) {
      throw error;
    }
  };
  otpVerification = async (enteredOTP: string): Promise<IUser> => {
    try {
      if (!this.userData) {
        throw new Error("User data not found");
      }
      if (enteredOTP !== this.otp) {
        throw new Error("Incorrect OTP");
      }
      const currentTime = new Date();
      if (currentTime > this.expiryOTP_time!) {
        throw new Error("OTP is expired");
      }
      console.log(enteredOTP);

      const hashedPassword = await bcrypt.hash(
        this.userData.password as string,
        10
      );
      this.userData.password = hashedPassword;
      this.userData!.user_id = uuidv4();
      console.log("otp", this.userData);
      const response: IUser = await this.userRepository.register(this.userData);

      this.otp = null;
      this.userData = null;

      return response;
    } catch (error) {
      throw error;
    }
  };
  resendOTP = async (): Promise<void> => {
    try {
      const Generated_OTP: string = Math.floor(
        1000 + Math.random() * 9000
      ).toString();
      this.otp = Generated_OTP;
      console.log(`Regenearted OTP : ${Generated_OTP}`);
      const isMailSended = await sendOTPmail(
        this.userData!.email,
        Generated_OTP
      );
      if (!isMailSended) {
        throw new Error("Email not send");
      }
      const OTP_createdTime = new Date();
      this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
      return;
    } catch (error) {
      throw error;
    }
  };
  verifyGoogleAuth = async (
    token: string
  ): Promise<{ userData: IUser; userToken: string; refreshToken: string }> => {
    try {
      // Attempt to verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.Google_clientID as string,
      });

      // Get payload and validate it exists
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error("Invalid Google token or email not found in payload");
      }
      const userData: IUser | null = await this.userRepository.verifyGoogleAuth(
        payload.email
      );
      if (!userData) {
        throw new Error("User not found");
      }

      if (userData.isBlocked) {
        throw new Error("User is blocked"); // Blocked users cannot authenticate
      }
      // Generate access and refresh tokens
      const userToken = createToken(userData.user_id as string, "USER");
      const refreshToken = createRefreshToken(
        userData.user_id as string,
        "USER"
      );

      // Return user data along with tokens
      return { userData, userToken, refreshToken };
    } catch (error) {
      console.error("Error verifying Google authentication:", error);
      throw error;
    }
  };
  resetPassword = async (email: string): Promise<void> => {
    try {
      const userData: IUser | null = await this.userRepository.resetPassword(
        email
      );
      console.log("userPasswrod", userData);
      if (!userData)
        throw new Error(
          "Sorry! You have no account in Projec-X. Please create an account"
        );
      const isMailSended = await sendResetPasswordLink(email, "User");
      console.log("isMail", isMailSended);

      if (!isMailSended) {
        throw new Error("Email not send");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  validateToken = async (token: string): Promise<void> => {
    try {
      const { email, role } = verifyResetPasswordToken(token);
      if (!email || !role) {
        throw new Error("Token has expired or is invalid.");
      }
    } catch (error: any) {
      throw error;
    }
  };
  confirmResetPassword = async (
    token: string,
    password: string
  ): Promise<void> => {
    try {
      const { email, role } = verifyResetPasswordToken(token);
      console.log("isValid", email);
      if (!email) {
        throw new Error("Token has expired or is invalid");
      }

      if (role !== "User") {
        throw new Error(
          "Unauthorized role. You must be a User to reset your password."
        );
      }
      await this.userRepository.confirmResetPassword(email, password);
    } catch (error: any) {
      throw error;
    }
  };
  updateUser = async (user_id: string, user: IUser): Promise<IUser | null> => {
    try {
      return await this.userRepository.updateUser(user_id, user);
    } catch (error) {
      throw error;
    }
  };
  profilePicture = async (
    user_id: string,
    profileURL: string
  ): Promise<string> => {
    try {
      return await this.userRepository.profilePicture(user_id, profileURL);
    } catch (error) {
      throw error;
    }
  };
  addRefferalCode = async (
    user_id: string,
    refferalCode: string
  ): Promise<IUser | null> => {
    try {
      return await this.userRepository.addRefferalCode(user_id, refferalCode);
    } catch (error) {
      throw error;
    }
  };
}

export default UserServices;
