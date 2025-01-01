import React, { useState, useEffect } from "react";
import {
  AtSymbolIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { setUserCredentials } from "../redux/Slices/UserAuth";
import Spinner from "../Loader/Loader";
import { RootState } from "../redux/RootState/RootState";
import { AdminData, UserData } from "../apiTypes/apiTypes";
import { adminLogout } from "../redux/Slices/AdminAuth";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userInfo) navigate("/home");
  }, [userInfo, navigate]);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleError = (message: string) => {
    toast.error(message || "Something went wrong, please try again later.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("/login", { email, password });
      if (response.status === 200) {
        setTimeout(() => {
          setLoading(false);
          dispatch(setUserCredentials(response.data));
          navigate("/home");
        }, 2000);
      }
      if (adminInfo) {
        let response = await api.get("/admin/logout", {
          withCredentials: true,
        });
        console.log(document.cookie);
        if (response.status == 200) {
          dispatch(adminLogout());
        }
      }
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message;
      if (message === "email not found") handleError("Email not found");
      else if (message === "Wrong password") handleError("Password is wrong");
      else if (message === "User is blocked")
        handleError("Your account has been blocked. Please contact support.");
      else handleError("");
    }
  };

  const handleGoogleLoginSuccess = async (response: any) => {
    try {
      setLoading(true);
      const res = await api.post("/google/auth", {
        token: response.credential,
      });
      if (res.status === 200) {
        setTimeout(() => {
          setLoading(false);
          dispatch(setUserCredentials(res.data));
          navigate("/home");
        }, 2000);
        if (userInfo) {
        }
      }
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message;
      if (message === "User not found") handleError("User not found");
      else if (message === "User is blocked")
        handleError("Your account has been blocked. Please contact support.");
      else handleError("");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Left Section */}
          <div className="lg:w-1/2 w-full h-1/2 lg:h-full relative bg-gray-100">
            <img
              src="/images/card.png"
              alt="landing"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
              <h1 className="text-4 xl lg:text-5xl text-white font-bold">
                Welcome!
              </h1>
              <p className="text-lg lg:text-2xl text-white mt-4">
                Access your projects seamlessly.
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="lg:w-1/2 w-full h-1/2 lg:h-full flex justify-center items-center bg-white p-4">
            <div className="p-6 w-full max-w-sm">
              <h2 className="hidden lg:block text-2xl font-bold text-center mb-6">
                Login
              </h2>

              <GoogleLogin
                shape="circle"
                logo_alignment="center"
                size="large"
                onSuccess={handleGoogleLoginSuccess}
              />

              <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="flex items-center border rounded-md p-2">
                  <AtSymbolIcon className="h-6 w-6 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 pl-2 bg-transparent outline-none text-sm"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="flex items-center border rounded-md p-2">
                  <LockClosedIcon className="h-6 w-6 text-gray-400" />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="flex-1 pl-2 bg-transparent outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="ml-2"
                  >
                    {passwordVisible ? (
                      <EyeIcon className="h-6 w-6 text-gray-400" />
                    ) : (
                      <EyeSlashIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end items-center text-sm">
                  {/* <label>
                    <input type="checkbox" className="mr-2" /> Remember me
                  </label> */}
                  <button
                    onClick={() => {
                      navigate("/forgot");
                    }}
                    className="text-blue-500"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 text-white w-full py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Log In
                </button>

                <p className="text-center mt-4 text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/sign-in")}
                    className="text-blue-500"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginForm;
