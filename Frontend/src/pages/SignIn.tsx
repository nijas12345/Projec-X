import { useState } from "react";
import { toast } from "react-toastify";
import {
  UserIcon,
  AtSymbolIcon,
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { log } from "node:console";
import Spinner from "../Loader/Loader";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); 
  

  // Navigate to login
  const handleGetStarted = (): void => {
    navigate("/login");
  };
  const handleLogin = (): void => {
    navigate("/login");
  };

  // State for form data and validation
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // State for password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  // Regex patterns for validation
  const nameRegex = /^[A-Za-z]+$/;
  const phoneRegex = /^[1-9]{1}[0-9]{9}$/; // Validates a 10-digit phone number starting with non-zero
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Validation function
  const validateForm = () => {
    const newErrors = {
      firstName: !nameRegex.test(firstName)
        ? "First Name must only contain letters"
        : "",
      lastName: !nameRegex.test(lastName)
        ? "Last Name must only contain letters"
        : "",
      email: !emailRegex.test(email)
        ? "Please enter a valid email address"
        : "",
      phone: !phoneRegex.test(phone) ? "Phone number must be 10 digits " : "",
      password: !passwordRegex.test(password)
        ? "Password must include one uppercase letter, one lowercase letter, one special character, and be at least 8 characters long"
        : "",
      confirmPassword:
        confirmPassword !== password ? "Passwords do not match" : "",
      terms: termsAccepted ? "" : "You must agree to the terms and conditions",
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  // Toggle password visibility
  const togglePasswordVisibility = (): void => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = (): void =>
    setShowConfirmPassword(!showConfirmPassword);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formData = {
        firstName,
        lastName,
        email,
        phone,
        password,
      };
      try {
        setLoading(true);
        
        if (token) {
          await api.post(`/register?refferalCode=${token}`, formData, {});
          setLoading(false)
          navigate("/otp");
        } else {
          await api.post("/register", formData);
          navigate("/otp");
        }
      } catch (error: any) {
        if (error.response.data.message === "Email already exists") {
          toast.error("Email already exists");
        }
      }
    }
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    field: string
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: "",
      }));
    };
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
       {loading ? (
        <Spinner />
      ) : (
        <>
      {/* Left side with the image and centered project title */}
      <div className="lg:w-1/2 w-full h-1/2 lg:h-full relative bg-gray-100">
        <img
          src="/images/card.png"
          alt="landing"
          className="w-full h-full object-cover rounded-r-lg"
        />
        {/* Project title and sentences centered on the image */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
          <h1 className="font-mulish text-4xl font-medium text-white">
            Don't have an account?
          </h1>
          <p className="font-mulish text-lg font-medium text-white mt-6">
            Let's get you all set up so you can access your personal account
          </p>
        </div>
      </div>
      {/* Right side with the sign-in form */}
      <div className="lg:w-1/2 w-full h-1/2 lg:h-full flex justify-center items-center bg-white p-4 mt-16 lg:mt-0 ">
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-3/4 mb-6 flex flex-col gap-2"
        >
          {/* First Name and Last Name Row */}
          <div className="flex gap-3 mb-3 lg:mb-5">
            {/* First Name */}
            <div className="w-full ">
              <div className="flex items-center border border-gray-300 rounded-md w-full overflow-hidden">
                <div className="bg-[#EDEDFF] p-1 w-10 h-8 flex justify-center items-center rounded">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={handleInputChange(setFirstName, "firstName")}
                  className="w-full py-1 px-2 text-gray-700 focus:outline-none border-none text-xs"
                />
              </div>
              {errors.firstName && (
                <p className="text-red-500 text-xs">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="w-full ">
              <div className="flex items-center border border-gray-300 rounded-md w-full overflow-hidden">
                <div className="bg-[#EDEDFF] p-1 w-10 h-8 flex justify-center items-center rounded">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={handleInputChange(setLastName, "lastName")}
                  className="w-full py-1 px-2 text-gray-700 focus:outline-none border-none text-xs"
                />
              </div>
              {errors.lastName && (
                <p className="text-red-500 text-xs">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email and Phone Number Row */}
          <div className="flex gap-3 mb-3 lg:mb-5">
            {/* Email */}
            <div className="w-full">
              <div className="flex items-center border border-gray-300 rounded-md w-full overflow-hidden">
                <div className="bg-[#EDEDFF] p-1 w-10 h-8 flex justify-center items-center rounded">
                  <AtSymbolIcon className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleInputChange(setEmail, "email")}
                  className="w-full py-1 px-2 text-gray-700 focus:outline-none border-none text-xs"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="w-full">
              <div className="flex items-center border border-gray-300 rounded-md w-full overflow-hidden">
                <div className="bg-[#EDEDFF] p-1 w-10 h-8 flex justify-center items-center rounded">
                  <PhoneIcon className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={handleInputChange(setPhone, "phone")}
                  className="w-full py-1 px-2 text-gray-700 focus:outline-none border-none text-xs"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="w-full">
            <div className="flex items-center border border-gray-300 rounded-md w-full overflow-hidden relative mb-2">
              <div className="bg-[#EDEDFF] p-1 w-10 h-8 flex justify-center items-center rounded">
                <LockClosedIcon className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handleInputChange(setPassword, "password")}
                className="w-full py-1 px-2 text-gray-700 focus:outline-none border-none text-xs"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="focus:outline-none absolute right-3"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="w-full">
            <div className="flex items-center border border-gray-300 rounded-md w-full overflow-hidden relative mb-2">
              <div className="bg-[#EDEDFF] p-1 w-10 h-8 flex justify-center items-center rounded">
                <LockClosedIcon className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleInputChange(
                  setConfirmPassword,
                  "confirmPassword"
                )}
                className="w-full py-1 px-2 text-gray-700 focus:outline-none border-none text-xs"
              />

              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="focus:outline-none absolute right-3"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="terms"
              className="form-checkbox"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="terms" className="text-gray-600 text-xs">
              I agree to the{" "}
              <a href="#" className="text-blue-500">
                terms and policies
              </a>
              .
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-xs">{errors.terms}</p>
          )}

          {/* Sign-Up Button */}
          <button
            type="submit"
            className="bg-[#5453ab] text-white font-bold py-1 px-3 rounded flex items-center gap-2 hover:bg-[#4a4a9b] transition duration-300 mx-auto font-mulish text-sm"
          >
            Create Account
          </button>

          {/* Sign-In link */}
          <p className="text-center text-gray-600 text-xs">
            Already have an account?{" "}
            <button
              onClick={handleLogin}
              className="text-blue-500 hover:underline"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
      </>
      )}
    </div>
  );
};

export default SignIn;
