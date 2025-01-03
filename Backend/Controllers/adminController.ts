import { Request, Response } from "express";
import { IAdminService } from "../Interfaces/admin.service.interface";
import HTTP_statusCode from "../Enums/httpStatusCode";
import { IAdmin } from "../Interfaces/commonInterface";
import Stripe from "stripe";
import stripe from "../Config/stripe_config";
import dotenv from "dotenv";
import { HttpStatusCode } from "axios";
import cloudinary from "../Config/cloudinary_config";
dotenv.config();
import fs from "fs/promises";
class AdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  // Admin Registration
  register = async (req: Request, res: Response) => {
    try {
      const adminData = req.body;
      await this.adminService.register(adminData);
      res
        .status(HTTP_statusCode.OK)
        .send("Admin registered successfully and OTP sent to email");
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

  // OTP Verification
  otpVerification = async (req: Request, res: Response) => {
    try {
      const enteredOTP: string = req.body.otp;
      console.log(enteredOTP);

      const serviceResponse = await this.adminService.otpVerification(
        enteredOTP
      );
      console.log(serviceResponse);
      res.status(HTTP_statusCode.OK).send(serviceResponse);
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
          .json({ message: "Something went wrong. Please try again later" });
      }
    }
  };

  // Resend OTP
  resendOTP = async (req: Request, res: Response) => {
    try {
      await this.adminService.resendOTP();
      res.status(HTTP_statusCode.OK).send("OTP sent again");
    } catch (error) {
      console.log("ResendOTP error", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Unable to resend OTP. Please try again later" });
    }
  };

  // Admin Login
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      console.log(req.body);

      const serviceResponse = await this.adminService.login(email, password);

      res.cookie("AdminRefreshToken", serviceResponse.adminRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("AdminAccessToken", serviceResponse.adminToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 30 * 60 * 1000,
      });

      res.status(HTTP_statusCode.OK).json(serviceResponse.adminData);
    } catch (error: any) {
      console.log("Admin:=loginerror", error);

      if (error.message === "Email not found") {
        res
          .status(HTTP_statusCode.NotFound)
          .json({ message: "Email not found" });
      } else if (error.message === "Wrong password") {
        res
          .status(HTTP_statusCode.unAuthorized)
          .json({ message: "Wrong password" });
      } else if (error.message === "Admin is blocked") {
        res
          .status(HTTP_statusCode.NoAccess)
          .json({ message: "Admin is blocked" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something went wrong. Please try again later" });
      }
    }
  };

  // Verify Google Authentication for Admin
  verifyGoogleAuth = async (req: Request, res: Response) => {
    try {
      const token: string = req.body.token as string;
      const serviceResponse = await this.adminService.verifyGoogleAuth(token);

      res.cookie("AdminRefreshToken", serviceResponse.adminRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("AdminAccessToken", serviceResponse.adminToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 30 * 60 * 1000,
      });

      res.status(HTTP_statusCode.OK).json(serviceResponse.adminData);
    } catch (error: any) {
      console.log("Admin:=google login error", error);

      if (error.message === "Admin not found") {
        res
          .status(HTTP_statusCode.NotFound)
          .json({ message: "Admin not found" });
      } else if (error.message === "Admin is blocked") {
        res
          .status(HTTP_statusCode.NoAccess)
          .json({ message: "Admin is blocked" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something went wrong. Please try again later" });
      }
    }
  };
  resetPassword = async (req: Request, res: Response) => {
    try {
      const email: string = req.body.email;
      await this.adminService.resetPassword(email);
      res.status(HTTP_statusCode.OK).send();
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  validateToken = async (req: Request, res: Response) => {
    try {
      const token = req.body.token;
      await this.adminService.validateToken(token);
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
      await this.adminService.confirmResetPassword(token, password);
      res.status(HTTP_statusCode.OK).send();
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: message });
    }
  };
  logout = async (req: Request, res: Response) => {
    try {
      res.clearCookie("AdminAccessToken", {
        httpOnly: true,
      });
      res.clearCookie("AdminRefreshToken", {
        httpOnly: true,
      });
      res.status(HTTP_statusCode.OK).json("Logged out successfully");
    } catch (error) {}
  };
  blockUser = async (req: Request, res: Response) => {
    try {
      const { user_id } = req.body;

      const serviceResponse = await this.adminService.userBlock(user_id);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      console.log("Block user error", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Unable to block user. Please try again later" });
    }
  };
  unBlockUser = async (req: Request, res: Response) => {
    try {
      const { user_id } = req.body;
      const serviceResponse = await this.adminService.userUnBlock(user_id);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      console.log("Block user error", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Unable to block user. Please try again later" });
    }
  };
  updateAdmin = async (req: Request, res: Response) => {
    try {
      const admin_id: string = req.admin_id as string;
      const admin: IAdmin = req.body;
      const serviceResponse = await this.adminService.updateAdmin(
        admin_id,
        admin
      );
      console.log(serviceResponse);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  adminProfilePicture = async (req: Request, res: Response) => {
    try {
      console.log("adminProfilePicture");
      
      const admin_id = req.admin_id as string;
      const file = req.file
      console.log("secureUrl")
            if(!file) throw new Error("No file exists")
             const result = await cloudinary.uploader.upload(
                      file.path,
                      { folder: "uploads" },
                      (error, result) => {
                        if (error) {
                          console.error("Cloudinary upload error:", error);
                        } else {
                          console.log("Cloudinary upload result:", result);
                        }
                      }
                    );
            console.log("secureUrl,",result.secure_url);
            
            await fs.unlink(file.path); // Deletes the file
            console.log("Local file deleted successfully");
            const profileURL:string = result.secure_url
      const serviceResponse = await this.adminService.adminProfilePicture(
        admin_id,
        profileURL
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error) {
      console.log(error);
    }
  };
  payment = async (req: Request, res: Response) => {
    try {
      const admin_id = req.admin_id as string;
      const subscription = req.body.subscription;
      console.log("admin", admin_id);
      console.log("subscription", subscription);
      const serviceResponse = await this.adminService.payment(
        admin_id,
        subscription
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      console.log(message);
      res.status(HTTP_statusCode.NoAccess).json({ message: message });
    }
  };

  handleWebhook = async (req: Request, res: Response) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    const signature = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );

      await this.adminService.handleWebHook(event);

      res.status(HTTP_statusCode.OK).json({ received: true });
    } catch (err: any) {
      res.status(HttpStatusCode.ServiceUnavailable).send();
      console.error("Webhook Error:", err);
    }
  };
}

export default AdminController;
