import { Request, Response } from "express";
import { IUserService } from "../Interfaces/user.service.interface";
import { IUser } from "../Interfaces/commonInterface";
import HTTP_statusCode from "../Enums/httpStatusCode";
import { log } from "node:console";

class UserController {
  private userService: IUserService;
  constructor(userService: IUserService) {
    this.userService = userService;
  }
  register = async (req: Request, res: Response) => {
    try {
      const refferalCode = req.query.token as string | null;
      const userData: IUser = req.body;
      userData.refferalCode = refferalCode;
      await this.userService.register(userData);
      res.status(HTTP_statusCode.OK).send("OTP send to mail");
    } catch (error: any) {
      if (error.message === "Email already exists") {
        res
          .status(HTTP_statusCode.Conflict)
          .json({ message: "Email already exists" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something went wrong. Please try again later" });
      }
    }
  };
  otpVerification = async (req: Request, res: Response) => {
    try {
      const enteredOTP: string = req.body.otp;
      console.log(enteredOTP);

      await this.userService.otpVerification(enteredOTP);
      res.status(HTTP_statusCode.OK).send();
    } catch (error: any) {
      console.log(error.message);

      if (error.message === "Incorrect OTP") {
        res
          .status(HTTP_statusCode.unAuthorized)
          .json({ message: "Incorrect OTP" });
      } else if (error.message == "OTP is expired") {
        res.status(HTTP_statusCode.Expired).json({ message: "OTP is expired" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something went wrong Please try again later" });
      }
    }
  };
  resendOTP = async (req: Request, res: Response) => {
    try {
      await this.userService.resendOTP();
      res.status(HTTP_statusCode.OK).send("OTP sended");
    } catch (error) {
      console.log("ResendOTP error", error);
    }
  };
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      console.log(req.body);
      const serviceResponse = await this.userService.login(email, password);
      res.cookie("RefreshToken", serviceResponse.refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("AccessToken", serviceResponse.userToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 30 * 60 * 1000,
      });
      res.status(HTTP_statusCode.OK).json(serviceResponse.userData);
    } catch (error: any) {
      console.log("User:=loginerror", error);
      if (error.message == "Email not found") {
        res
          .status(HTTP_statusCode.NotFound)
          .json({ message: "email not found" });
      } else if (error.message == "Wrong password") {
        res
          .status(HTTP_statusCode.unAuthorized)
          .json({ message: "Wrong password" });
      } else if (error.message === "User is blocked") {
        res
          .status(HTTP_statusCode.NoAccess)
          .json({ message: "User is blocked" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something wrong please try again later" });
      }
    }
  };
  verifyGoogleAuth = async (req: Request, res: Response) => {
    try {
      const token: string = req.body.token as string;
      const serviceResponse = await this.userService.verifyGoogleAuth(token);

      res.cookie("RefreshToken", serviceResponse.refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("AccessToken", serviceResponse.userToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 30 * 60 * 1000,
      });
      res.status(HTTP_statusCode.OK).json(serviceResponse.userData);
    } catch (error: any) {
      console.log("User:= google login error", error);
      if (error.message === "User not found") {
        res
          .status(HTTP_statusCode.NotFound)
          .json({ message: "User not found" });
      } else if (error.message === "User is blocked") {
        res
          .status(HTTP_statusCode.NoAccess)
          .json({ message: "User is blocked" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something wrong please try again later" });
      }
    }
  };
  resetPassword = async (req: Request, res: Response) => {
    try {
      const email: string = req.body.email;
      await this.userService.resetPassword(email);
      res.status(HTTP_statusCode.OK).send();
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  validateToken = async (req: Request, res: Response) => {
    try {
      const token = req.body.token;
      console.log("token", token);

      await this.userService.validateToken(token);
      res.status(HTTP_statusCode.OK).send();
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  confirmResetPassword = async (req: Request, res: Response) => {
    try {
      const token = req.body.token as string;
      const password = req.body.passord as string;
      await this.userService.confirmResetPassword(token, password);
      res.status(HTTP_statusCode.OK).send();
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  updateUser = async (req: Request, res: Response) => {
    try {
      const user_id: string = req.user_id as string;
      const user: IUser = req.body;
      const serviceResponse = await this.userService.updateUser(user_id, user);
      console.log(serviceResponse);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  logout = async (req: Request, res: Response) => {
    try {
      res.clearCookie("AccessToken", {
        httpOnly: true,
      });
      res.clearCookie("RefreshToken", {
        httpOnly: true,
      });

      res.status(HTTP_statusCode.OK).json("Logged out successfully");
    } catch (error) {
      console.log(error);
    }
  };
  profilePicture = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const profileURL = req.file?.filename as string;
      const serviceResponse = await this.userService.profilePicture(
        user_id,
        profileURL
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  addRefferalCode = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const refferalCode = req.body.refferalCode;
      const serviceResponse = await this.userService.addRefferalCode(
        user_id,
        refferalCode
      );

      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error) {
      res
        .status(HTTP_statusCode.NotFound)
        .json({
          message:
            "Your Refferal Code is wrong. Please Enter the correct Refferal Code",
        });
    }
  };
}
export default UserController;
