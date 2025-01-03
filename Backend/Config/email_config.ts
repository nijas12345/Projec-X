const nodemailer = require("nodemailer");
import dotenv from "dotenv";
import { resetPasswordToken } from "./jwt_config";
dotenv.config();

export const sendInvitationLink = async (
  email: string,
  refferalCode: string
): Promise<boolean> => {
  const invitationLink = `${process.env.CLIENT_URL}?token=${refferalCode}`;
  console.log("invitationLink",invitationLink);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ServerEmail as string,
      pass: process.env.ServerPassword as string,
    },
  });

  const mailOptions = {
    from: process.env.ServerEmail as string,
    to: email,
    subject: "ProjectX Invitation",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 100px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <p style="font-size: 1.1em">Hi,</p>
          <p>This message is from Project-Management App. Please click the link below to register your account:</p>
          <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; font-size: 1em; color: #ffffff; background-color: #444; text-decoration: none; border-radius: 4px;">Register Link</a>
          <p style="font-size: 0.9em;">Regards,<br />Project-Management App</p>
          <hr style="border: none; border-top: 1px solid #eee" />
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification link sent to email");
    return true;
  } catch (error) {
    console.error("Error in sending verification email:", error);
    return false;
  }
};

export const sendResetPasswordLink = async (
  email: string,
  role: string
): Promise<boolean> => {
  const token = resetPasswordToken(email, role);
  console.log("token", token);

  let resetLink;
  if (role == "User") {
    resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  } else {
    resetLink = `${process.env.CLIENT_URL}/admin/reset-password/${token}`;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ServerEmail as string,
      pass: process.env.ServerPassword as string,
    },
  });

  const mailOptions = {
    from: process.env.ServerEmail as string,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 100px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <p style="font-size: 1.1em">Hi,</p>
          <p>We received a request to reset your password. Please click the link below to reset your password. This link will expire in 5 minutes:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; font-size: 1em; color: #ffffff; background-color: #444; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
          <p style="font-size: 0.9em;">Regards,<br />Project-Management App</p>
          <hr style="border: none; border-top: 1px solid #eee" />
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset password link sent to email");
    return true;
  } catch (error) {
    console.error("Error in sending reset password email:", error);
    return false;
  }
};

export const sendInvoiceEmail = async (
  customerEmail: string,
  amountPaid: string,
  currencyDollar: string,
  invoiceUrl: string
) => {
  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ServerEmail as string,
      pass: process.env.ServerPassword as string,
    },
  });

  const mailOptions = {
    from: process.env.ServerEmail as string,
    to: customerEmail,
    subject: "Invoice from projec-X",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h1 style="color: #333; text-align: center; font-size: 24px; margin-bottom: 20px;">Invoice Details</h1>
  
  <p style="font-size: 16px; color: #555; text-align: center; margin: 0;">
    <strong style="font-size: 18px; color: #222;">Project-X</strong>
  </p>
  
  <div style="background-color: #ffffff; padding: 15px; margin-top: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 16px; color: #444;">Thank you for your payment of 
      <strong style="color: #007BFF; font-size: 18px;">${amountPaid} ${currencyDollar}</strong>.
    </p>
    <p style="font-size: 16px; color: #444;">We appreciate your business and are excited to serve you.</p>
    
    <p style="font-size: 16px; text-align: center; margin-top: 20px;">
      <a href="${invoiceUrl}" target="_blank" style="display: inline-block; text-decoration: none; color: #fff; background-color: #007BFF; padding: 10px 20px; border-radius: 5px; font-size: 16px;">View Your Invoice</a>
    </p>
  </div>
  
  <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #777;">
    <p>If you have any questions, feel free to contact us at <a href="mailto:support@project-x.com" style="color: #007BFF; text-decoration: none;">support@project-x.com</a>.</p>
    <p>© 2024 Project-X. All rights reserved.</p>
  </footer>
</div>

     `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Invoice email sent successfully to:", customerEmail);
  } catch (error) {
    console.error("Error sending invoice email:", error);
  }
};

export const sendOTPmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ServerEmail as string,
      pass: process.env.ServerPassword as string,
    },
  });

  const mailOptions = {
    from: process.env.ServerEmail as string,
    to: email,
    subject: "ProjecX OTP Verification",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 100px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <p style="font-size: 1.1em">Hi,</p>
          <p>This message is from Project-Management App. Use the following OTP to complete your registration procedures. OTP is valid for two minutes.</p>
          <h2 style="background: linear-gradient(90deg, rgba(87, 67, 66, 1) 14%, rgba(31, 20, 20, 1) 68%, rgba(57, 36, 36, 1) 100%); margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
          <p style="font-size: 0.9em;">Regards,<br />Project-Management App</p>
          <hr style="border: none; border-top: 1px solid #eee" />
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to email");
    return true;
  } catch (error) {
    console.error("Error in sending OTP email:", error);
    return false;
  }
};
