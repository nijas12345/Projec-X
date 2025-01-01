import React, { useState, useEffect } from "react";
import LeftNavBar from "../components/user-left-nav";
import ProjectSidebar from "../components/mid-nav";
import RightComponent from "../components/right-nav";
import Dashboard from "../components/dashboard";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import { INotification, UserData } from "../apiTypes/apiTypes";
import "../css/tailwind.css";
import { Bars3Icon } from "@heroicons/react/24/outline";
import io, { Socket } from "socket.io-client";

import api from "../utils/axiosInstance";
import Notifications from "../components/notifications";
import { setUserCredentials } from "../redux/Slices/UserAuth";
import { toast } from "react-toastify";
import Tasks from "../components/task-details";

const backendURL = import.meta.env.VITE_BACKEND_API_URL;
let socket: Socket | null = null;

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tasks" | "notifications"
  >("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [refferalCode, setRefferalCode] = useState<string>("");

  const handleRefferal = async () => {
    try {
      if (refferalCode.trim().length == 0) {
        toast.error("Please Enter the refferal Code");
        return;
      }
      const response = await api.post("/refferalCode", {
        refferalCode: refferalCode,
      });
      console.log(response.data);

      if (response.status == 200) {
        dispatch(setUserCredentials(response.data));
      }
    } catch (error: any) {
      toast.error(
        "Your Refferal Code is wrong. Please Enter the correct Refferal Code"
      );
    }
  };

  useEffect(() => {
    if (userInfo && !userInfo.isBlocked) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab]);
  const fetchNotifications = async () => {
    const response = await api.get("get-notifications");
    console.log("response");

    if (response.status === 200) {
      setNotifications(response.data);
    }
  };
  useEffect(() => {
    if (!socket) {
      socket = io(backendURL);
    }
    if (socket && userInfo) {
      socket.emit("userOnline", userInfo.user_id); // Emit the user's ID
      console.log(`User ${userInfo.user_id} is now online`);
    }
    return () => {
      socket?.emit("useroffline", userInfo?.user_id);
      socket?.off("disconnect"); // Cleanup listener
    };
  }, []);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar toggle button (visible only on mobile) */}
      {!userInfo?.refferalCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white h-[85%] w-[85%] max-w-3xl p-6 rounded shadow-lg relative">
            {/* Top Left: Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                Projec<span className="text-[#00A3FF]"></span>
                <span className="text-[#00A3FF]">-X</span>
              </span>
            </div>

            {/* Top Right: Welcome Message */}
            <div className="absolute top-4 right-4 text-right">
              <h2 className="text-lg font-bold">Welcome!</h2>
              <p className="text-gray-500">
                {userInfo?.firstName || "Your Company"}
              </p>
            </div>

            {/* Center Section: Steps */}
            <div className="flex flex-col justify-center items-center h-full">
              <div className="text-center">
                <h2 className="text-lg font-bold mb-4">Refferal Code</h2>
                <input
                  type="text"
                  placeholder="Enter company Refferal Code"
                  value={refferalCode}
                  onChange={(e) => setRefferalCode(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                />
                <div className="flex justify-between mt-4 w-full">
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded w-1/2 mr-2"
                  >
                    Home
                  </button>
                  <button
                    onClick={handleRefferal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded w-1/2 ml-2"
                  >
                    Submit
                  </button>
                </div>
              </div>
              <div>
                <p className="text-center mt-4 text-sm">
                  Don't have it, please ask the company Project Manager.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 w-12 h-10 left-0 z-50 p-0 bg-[#EDEDFF] rounded shadow-md md:hidden"
      >
        <Bars3Icon className="w-6 h-6 ml-3 text-gray-600" />
      </button>

      {/* Overlay for mobile view */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* LeftNavBar */}
      <div
        className={` z-40 inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-1"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[4.5%] bg-white shadow-md md:shadow-none`}
      >
        <LeftNavBar />
      </div>

      {/* ProjectSidebar */}
      <div
        className={`fixed z-20 inset-y-0 lg:left-[0.3%] left-[15%] transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[22%] bg-white shadow-md md:shadow-none`}
        style={{
          width: isSidebarOpen ? "85%" : "22%",
        }}
      >
        <ProjectSidebar />
      </div>
      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarOpen ? "hidden md:block" : "block"
        } bg-[#EDEDFF] transition-all duration-300 ease-in-out`}
      >
        <RightComponent onTabSelect={setActiveTab} socket={socket} />

        {/* Dashboard or Component */}
        <div className="hide-scrollbar h-full overflow-auto p-4 ">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "tasks" && <Tasks socket={socket} />}
          {activeTab === "notifications" && (
            <Notifications notifications={notifications} />
          )}
        </div>
      </div>
    </div>
  );
}
