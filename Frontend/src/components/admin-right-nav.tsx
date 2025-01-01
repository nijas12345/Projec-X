import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AdminData } from "../apiTypes/apiTypes";
import { RootState } from "../redux/RootState/RootState";
import { RightComponentProps, INotification } from "../apiTypes/apiTypes";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/axiosInstance";

const AdminRightComponent: React.FC<RightComponentProps> = ({
  onTabSelect,
  socket,
}) => {
  useEffect(() => {
    if (socket) {
      socket.off("receiveUserNotification");
      socket.on("receiveUserNotification", (data) => {
        toast.info(data.message);
      });
    }

    // Clean up listener on component unmount
    return () => {
      socket?.off("receiveUserNotification");
    };
  }, [socket]); // Dependency ensures the effect runs when `socket` changes

  const navigate = useNavigate();
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tasks" | "notifications"
  >("dashboard");
  const [unreadCount, setUnreadCount] = useState(0); // State to hold unread notifications count

  const handleTabClick = (tab: "dashboard" | "tasks" | "notifications") => {
    setActiveTab(tab);
    onTabSelect(tab); // Notify Home component of the selected tab
    if (tab === "notifications") {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotificationsCount();
  }, [activeTab]);

  // Fetch notifications and set unread count
  const fetchNotificationsCount = async () => {
    const response = await api.get("/admin/get-notifications-count");
    if (response.status === 200) {
      setNotifications(response.data);
    }
  };

  useEffect(() => {
    const count = notifications.filter(
      (notification) => !notification.isRead
    ).length;
    setUnreadCount(count);
  }, [notifications]);

  const adminProfile = () => {
    navigate("/admin/profile");
  };

  return (
    <div className="bg-[#EDEDFF] shadow rounded-sm ml-2 lg:ml-0 p-2 mb-4">
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
          <button
            onClick={() => handleTabClick("notifications")}
            className={`relative text-black-600 text-lg font-semibold  ${
              activeTab === "notifications" ? "border-b-2 border-blue-600" : ""
            }`}
          >
            <Bell className="h-6 w-6" />

            {/* Notification count above the icon */}
            {unreadCount > 0 && (
              <span className="absolute top-[-5px] right-[-5px] text-xs text-white bg-red-500 rounded-full px-2 py-0 font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button onClick={adminProfile}>
            <img
              src={adminInfo?.profileImage}
              alt="Profile"
              className="h-8 w-8 rounded-full"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRightComponent;
