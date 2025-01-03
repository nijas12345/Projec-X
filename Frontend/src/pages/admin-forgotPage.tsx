import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/axiosInstance";

export const AdminForgotPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // State to track success

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await api.put("/admin/reset-password", {
        email: email,
      });

      if (response.status === 200) {
        setMessage(
          `Thanks! If ${email} matches an email we have on file, we've sent you an email containing further instructions for resetting your password.`
        );
        setIsSuccess(true); // Set success state to true
      } else {
        setMessage("Failed to send reset link. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed to send reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.put("/admin/reset-password", { email });
      if (response.status === 200) {
        toast.success("Reset password link resent successfully.");
      } else {
        toast.error("Failed to resend reset link.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to resend reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryDifferentEmail = () => {
    setEmail("");
    setMessage("");
    setIsSuccess(false);
  };

  return (
    <div className="bg-[#F0F5F8] w-full h-screen relative">
      {/* Top Left Section */}
      <div className="absolute top-12 left-10">
      <button onClick={()=>{navigate('/')}} className="flex items-center">
          <span className="text-2xl font-bold">
            Projec<span className="text-[#00A3FF]">-X</span>
          </span>
        </button>
      </div>

      {/* Forgot Password Section */}
      <div className="flex h-full items-center justify-center">
        <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg">
          {isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
                Check your email
              </h2>
              <p className="text-gray-600 text-center mb-4 whitespace-pre-line">
                {message}
              </p>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Didn’t receive the email?{" "}
                  <span
                    onClick={handleResend}
                    className="text-indigo-600 hover:underline cursor-pointer"
                  >
                    Resend
                  </span>{" "}
                  or{" "}
                  <span
                    onClick={handleTryDifferentEmail}
                    className="text-indigo-600 hover:underline cursor-pointer"
                  >
                    Try a different email
                  </span>
                  .
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
                Reset your password
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Enter the email address associated with your account, and we'll
                send you a link to reset your password.
              </p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Continue"}
                </button>
              </form>
              {message && (
                <div className="mt-4 text-center text-sm text-gray-600 whitespace-pre-line">
                  {message}
                </div>
              )}
            </>
          )}

          {!isSuccess && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                New to Projec-X?{" "}
                <button
                  onClick={() => navigate("/sign-in")}
                  className="text-indigo-600 hover:underline"
                >
                  Create account
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
