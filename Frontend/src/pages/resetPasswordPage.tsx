import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import api from "../utils/axiosInstance";

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Missing token. Please use the link sent to your email.");
        navigate("/forgot-password");
        return;
      }

      try {
        const response = await api.put("/validate-reset-token", { token });
        if (response.status === 200) {
          setIsTokenValid(true);
        } else {
          setIsTokenExpired(true); // Set state to show expired message
        }
      } catch (error) {
        setIsTokenExpired(true); // Set state to show expired message
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    console.log("password", password);

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(password)) {
      toast.error(
        "Password must contain at least one uppercase letter, one lowercase letter, and be at least 8 characters long."
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.put("/change-password", { password, token });
      if (response.status === 200) {
        toast.success("Password reset successfully. Please log in.");
        navigate("/login");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F0F5F8] w-full h-screen flex items-center justify-center">
      <div className="absolute top-12 left-10 flex items-center">
      <button onClick={()=>{navigate('/')}} className="flex items-center">
          <span className="text-2xl font-bold">
            Projec<span className="text-[#00A3FF]">-X</span>
          </span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg">
        {isTokenExpired ? (
          <div className="text-center text-red-600">
            <h3 className="text-lg font-semibold">Your link has expired.</h3>
            <p>Please request a new reset link to continue.</p>
          </div>
        ) : isTokenValid ? (
          <>
            <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
              Reset Your Password
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Enter and confirm your new password below.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-600"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-3"
                  >
                    {passwordVisible ? (
                      <EyeIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-600"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    className="absolute right-3 top-3"
                  >
                    {confirmPasswordVisible ? (
                      <EyeIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <p className="text-gray-600 text-center">
            Validating your request. Please wait...
          </p>
        )}
      </div>
    </div>
  );
};
