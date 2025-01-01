import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserData } from "../apiTypes/apiTypes";
import { RootState } from "../redux/RootState/RootState";
import "react-toastify/dist/ReactToastify.css";

const MeetingRightComponent: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );
  const [unreadCount, setUnreadCount] = useState(0); // State to hold unread notifications count

  const userProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="bg-[#EDEDFF] shadow rounded-sm ml-2 lg:ml-0 p-2 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4 "></div>

        <div className="flex items-center space-x-4">
          <button>
            <Bell className="h-6 w-6" />

            {/* Notification count above the icon */}
            {unreadCount > 0 && (
              <span className="absolute top-[-5px] right-[-5px] text-xs text-white bg-red-500 rounded-full px-2 py-0 font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button onClick={userProfile}>
            <img
              src={userInfo?.profileImage}
              alt="Profile"
              className="h-8 w-8 rounded-full"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRightComponent;
