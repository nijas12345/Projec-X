import React, { useState } from "react";
import { UserData } from "../apiTypes/apiTypes";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { setUserCredentials, userLogout } from "../redux/Slices/UserAuth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ProfileSidebarProps {
  userInfo: UserData | null;
}

const ProfileDetails: React.FC<ProfileSidebarProps> = ({ userInfo }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>(userInfo?.firstName || "");
  const [lastName, setLastName] = useState<string>(userInfo?.lastName || "");
  const [phone, setPhone] = useState<string>(userInfo?.phone || "");
  const [email, setEmail] = useState<string>(userInfo?.email || "");
  const [address, setAddress] = useState<string>(userInfo?.address || "");
  const [position, setPosition] = useState<string>(userInfo?.position || "");
  const [city, setCity] = useState<string>(userInfo?.city || "");
  const [state, setState] = useState<string>(userInfo?.state || "");

  const handleSave = async () => {
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !position ||
      !city ||
      !state
    ) {
      toast.error("All fields are required.");
      return;
    }

    const firstNameRegex = /^[a-zA-Z\s]+$/;
    if (!firstNameRegex.test(firstName)) {
      toast.error("First name must not contain numbers or special characters.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    const userDetails = {
      firstName,
      lastName,
      phone,
      address,
      position,
      city,
      state,
    };

    try {
      const response = await api.post("/update-user", userDetails);
      console.log(response);

      if (response.status === 200) {
        toast.success("User details saved successfully!");
        dispatch(setUserCredentials(response.data));
      }
    } catch (error: any) {
      console.log(error);
      if (error.response.data.message == "Access denied. User is blocked.") {
        toast.error(error.response.data.message);
        setTimeout(() => {
          navigate("/login");
          dispatch(userLogout());
        }, 3000);
      }
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-6">
        <div className="flex space-x-4">
          <button>
            <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
          </button>
          {/* <h2 className="text-lg font-semibold mb-2">General Settings</h2> */}
        </div>
        <div className="bg-white p-4 rounded-lg shadow ">
          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Phone
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly
              />
            </div>
          </div>

          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                State/Country
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Enter state or country"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                City
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Position
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Enter position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
