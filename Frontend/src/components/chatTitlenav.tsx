// RightComponent.tsx
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserData } from "../apiTypes/apiTypes";
import { RootState } from "../redux/RootState/RootState";

interface RightComponentProps {
  onTabSelect: (tab: "dashboard" | "tasks") => void;
}

const RightComponent: React.FC<RightComponentProps> = ({ onTabSelect }) => {
  const navigate = useNavigate();
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );

  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks">(
    "dashboard"
  );

  const handleTabClick = (tab: "dashboard" | "tasks") => {
    setActiveTab(tab);
    onTabSelect(tab); // Notify Home component of the selected tab
  };

  const userProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="bg-[#EDEDFF] shadow rounded-sm ml-2  lg:ml-0 p-2 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4 ">
          <button
            onClick={() => handleTabClick("dashboard")}
            className={`text-black-600 ml-14 lg:ml-0 text-lg font-semibold pb-3 ${
              activeTab === "dashboard" ? "border-b-2 border-blue-600 " : ""
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabClick("tasks")}
            className={`text-black-600 text-lg font-semibold pb-3 ${
              activeTab === "tasks" ? "border-b-2 border-blue-600" : ""
            }`}
          >
            Tasks
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-black-600">
            <Bell className="h-6 w-6" />
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

export default RightComponent;
