import {
  IAdmin,
  IProject,
  IUser,
  Projects,
} from "../Interfaces/commonInterface";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import {
  sendInvoiceEmail,
  sendOTPmail,
  sendResetPasswordLink,
} from "../Config/email_config";
import {
  createToken,
  createRefreshToken,
  verifyResetPasswordToken,
} from "../Config/jwt_config";
import { OAuth2Client } from "google-auth-library";
import { IAdminService } from "../Interfaces/admin.service.interface";
import { IAdminRepository } from "../Interfaces/admin.repository.interface";
import stripe from "../Config/stripe_config";
import Stripe from "stripe";
import { log } from "node:console";
import { stat } from "node:fs";
import { HttpStatusCode } from "axios";

const client = new OAuth2Client(`${process.env.Google_clientID}`);
class AdminServices implements IAdminService {
  private adminRepository: IAdminRepository;
  private adminData: IAdmin | null = null;
  private otp: string | null = null;
  private expiryOTP_time: Date | null = null;
  constructor(adminRepository: IAdminRepository) {
    this.adminRepository = adminRepository;
  }
  login = async (
    email: string,
    password: string
  ): Promise<{
    adminData: IAdmin;
    adminToken: string;
    adminRefreshToken: string;
  }> => {
    try {
      const adminData = await this.adminRepository.login(email);
      if (!adminData) throw new Error("Email not found");
      console.log("adminData",adminData);
      
      if (!adminData) throw new Error("Email not found");
      if(!adminData.password) throw new Error("Please login through google")
      const comparePassword = await bcrypt.compare(
        password,
        adminData.password as string
      );
      if (!comparePassword) throw new Error("Wrong password");

      const adminToken = createToken(adminData.admin_id as string, "ADMIN");
      const adminRefreshToken = createRefreshToken(
        adminData.admin_id as string,
        "ADMIN"
      );

      return { adminToken, adminRefreshToken, adminData };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  register = async (adminData: IAdmin): Promise<void> => {
    try {
      const alreadyExists: IAdmin | null =
        await this.adminRepository.findByEmail(adminData.email);
      if (alreadyExists) {
        throw new Error("Email already exists");
      }
      this.adminData = adminData;

      const generatedOtp: string = Math.floor(
        1000 + Math.random() * 9000
      ).toString();
      this.otp = generatedOtp;
      console.log(`generatedOTp${generatedOtp}`);
      const isMailSended = await sendOTPmail(adminData.email, generatedOtp);
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
  otpVerification = async (enteredOTP: string): Promise<IAdmin> => {
    try {
      if (!this.adminData) {
        throw new Error("Admin data not found");
      }
      if (enteredOTP !== this.otp) {
        console.log("kahkfi");

        throw new Error("Incorrect OTP");
      }
      const currentTime = new Date();
      if (currentTime > this.expiryOTP_time!) {
        throw new Error("OTP is expired");
      }
      console.log(enteredOTP);

      const hashedPassword = await bcrypt.hash(
        this.adminData.password as string,
        10
      );
      this.adminData.password = hashedPassword;
      this.adminData!.admin_id = uuidv4();
      console.log("otp", this.adminData);
      const response: IAdmin = await this.adminRepository.register(
        this.adminData
      );

      this.otp = null;
      this.adminData = null;

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
        this.adminData!.email,
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
  ): Promise<{
    adminData: IAdmin;
    adminToken: string;
    adminRefreshToken: string;
  }> => {
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

      const adminData: IAdmin | null =
        await this.adminRepository.verifyGoogleAuth(payload.email);
      if (!adminData) {
        throw new Error("Admin not found");
      }

      const adminToken = createToken(adminData.admin_id as string, "ADMIN");
      const adminRefreshToken = createRefreshToken(
        adminData.admin_id as string,
        "ADMIN"
      );

      // Return admin data along with tokens
      return { adminData, adminToken, adminRefreshToken };
    } catch (error) {
      console.error("Error verifying Google authentication:", error);
      throw error;
    }
  };
  resetPassword = async (email: string): Promise<void> => {
    try {
      const adminData: IAdmin | null = await this.adminRepository.resetPassword(
        email
      );
      console.log("userPasswrod", adminData);
      if (!adminData)
        throw new Error(
          "Sorry! You have no account in Projec-X. Please create an account"
        );
      const isMailSended = await sendResetPasswordLink(email, "Admin");
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

      if (role !== "Admin") {
        throw new Error(
          "Unauthorized role. You must be a User to reset your password."
        );
      }
      await this.adminRepository.confirmResetPassword(email, password);
    } catch (error: any) {
      throw error;
    }
  };
  userBlock = async (user_id: string): Promise<IUser> => {
    try {
      const userData = await this.adminRepository.userBlock(user_id);
      if (!userData) throw new Error("No user Data");
      return userData;
    } catch (error) {
      throw error;
    }
  };
  userUnBlock = async (user_id: string): Promise<IUser> => {
    try {
      const userData = await this.adminRepository.userUnBlock(user_id);
      if (!userData) throw new Error("No user Data");
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
      return await this.adminRepository.updateAdmin(admin_id, admin);
    } catch (error) {
      throw error;
    }
  };
  adminProfilePicture = async (
    admin_id: string,
    profileURL: string
  ): Promise<string> => {
    try {
      return await this.adminRepository.adminProfilePicture(
        admin_id,
        profileURL
      );
    } catch (error) {
      throw error;
    }
  };
  payment = async (admin_id: string, subscription: string): Promise<string> => {
    try {
      const amount = subscription === "pro" ? 15900 : 2000;
      const interval = subscription === "pro" ? "year" : "month";

      const product = await stripe.products.create({
        name:
          subscription === "pro" ? "Pro Subscription" : "Basic Subscription",
        description:
          subscription === "pro"
            ? "Annual subscription for Pro plan."
            : "Monthly subscription for Basic plan.",
      });

      const price = await stripe.prices.create({
        unit_amount: amount, // Amount in cents
        currency: "usd",
        recurring: {
          interval,
        },
        product: product.id,
      });

      const sessionResponse = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: price.id, // Using the price created earlier
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `https://projecx.online/admin/success`,
        cancel_url: `https://projecx.online/admin/cancel?subscription=${subscription}`,
        metadata: {
          subscription: subscription, // Store the subscription plan type ('pro' or 'basic')
          admin_id: admin_id, // Store the admin ID
          interval: interval, // Store the subscription interval ('month' or 'year')
        },
      });

      const session = sessionResponse as Stripe.Checkout.Session;
      const activeSubscription = await this.adminRepository.activeSubscription(
        admin_id
      );
      if (!session.url) {
        throw new Error("Session URL is null. Unable to proceed.");
      }
      return session.url;
    } catch (error) {
      console.error("Error processing subscription:", error);
      throw error;
    }
  };
  handleWebHook = async (event: Stripe.Event): Promise<void> => {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          console.log("session", session);
          console.log("checkout.session.completed");
          const paymentIntentId = session.payment_intent as string;
          const subscription = session.metadata?.subscription; // 'pro' or 'basic'
          const interval = session.metadata?.interval; // 'month' or 'year'
          const admin_id = session.metadata?.admin_id;
          const amount = session.amount_total;
          const customer = session.customer as string;

          let endDate: Date = new Date();
          if (interval === "year") {
            endDate.setFullYear(endDate.getFullYear() + 1); // Add 1 year
          } else if (interval === "month") {
            endDate.setMonth(endDate.getMonth() + 1); // Add 1 month
          }

          if (!admin_id) throw new Error("No Admin data");
          if (!subscription) throw new Error("No subscription plan");
          if (!amount) throw new Error("No amount");
          await this.adminRepository.payment(
            admin_id,
            subscription,
            amount,
            customer
          );

          console.log("Payment successful! Subscription has been processed.");
          break;

        case "invoice.payment_succeeded":
          const { customer_email, hosted_invoice_url, amount_paid, currency } =
            event.data.object as Stripe.Invoice;

          const customerEmail: string = customer_email ?? ""; // Fallback to empty string if undefined or null
          const invoiceUrl: string = hosted_invoice_url ?? ""; // Fallback to empty string if undefined or null
          const amountPaid: string = (amount_paid / 100).toFixed(2); // Convert cents to dollars
          const currencyDollar: string = currency.toUpperCase(); // Ensure currency is in uppercase

          if (customerEmail) {
            await sendInvoiceEmail(
              customerEmail,
              amountPaid,
              currencyDollar,
              invoiceUrl
            );
          } else {
            console.error("Customer email not found for invoice:");
          }
          break;

        case "customer.subscription.deleted":
          const subscriptionDeleted = event.data.object as Stripe.Subscription;
          const deletedSubscriptionId = subscriptionDeleted.id;
          const customerId = subscriptionDeleted.customer as string;

          await this.adminRepository.updatePaymentStatus(customerId);

          console.log("Subscription cancellation processed successfully.");
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error("Error handling webhook:", error);
      throw error; // Rethrow the error after logging it
    }
  };
}

export default AdminServices;
