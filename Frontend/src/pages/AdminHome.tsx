import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import {
  INotification,
  AdminData,
  Company,
  Member,
  CompanyMember,
} from "../apiTypes/apiTypes";
import "../css/tailwind.css";
import { Bars3Icon } from "@heroicons/react/24/outline";
import io, { Socket } from "socket.io-client";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { setAdminCredentials } from "../redux/Slices/AdminAuth";
import AdminLeftNavBar from "../components/admin-left-nav";
import { MailIcon } from "lucide-react";
import AdminProjectSidebar from "../components/admin-midnav";
import AdminRightComponent from "../components/admin-right-nav";
import AdminDashboard from "../components/admin-dashboard";
import AdminTaskDetails from "../components/admin-task-details";
import Notifications from "../components/notifications";

const backendURL = import.meta.env.VITE_BACKEND_API_URL;
let socket: Socket | null = null;

export default function AdminHome() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tasks" | "notifications"
  >("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [step, setStep] = useState<number>(1);
  const [companyName, setCompanyName] = useState<string>("");
  const [companyDescription, setCompanyDescription] = useState<string>("");
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [memberEmail, setMemberEmail] = useState<string>("");
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const validationHandlers = [
    () => {
      // Validation for step 1: Company Name
      if (!companyName.trim() || /^\d+$/.test(companyName)) {
        toast.error(
          !companyName.trim()
            ? "Company Name is required."
            : "Company Name cannot be all digits. Please enter a valid name."
        );
        return false;
      }
      return true;
    },
    () => {
      // Validation for step 2: Company Description
      if (!companyDescription.trim()) {
        toast.error("Company Description is required.");
        return false;
      }
      return true;
    },
  ];

  const handleNext = () => {
    // Execute the validation for the current step
    if (validationHandlers[step - 1]?.()) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => setStep((prev) => prev - 1);

  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/home");
    } else {
      navigate("/admin/login");
    }
  }, [adminInfo, navigate]);

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab]);
  const fetchNotifications = async () => {
    const response = await api.get("/admin/get-notifications");
    console.log("response");

    if (response.status === 200) {
      setNotifications(response.data);
    }
  };
  useEffect(() => {
    if (!socket) {
      socket = io(backendURL);
      console.log("socket", socket);
    }
    if (socket && adminInfo) {
      socket.emit("userOnline", adminInfo.admin_id); // Emit the user's ID
      console.log(`User ${adminInfo.admin_id} is now online`);
    }
    return () => {
      socket?.emit("useroffline", adminInfo?.admin_id);
      socket?.off("disconnect"); // Cleanup listener
    };
  }, []);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const submitDetails = async () => {
    if (invitedMembers.length === 0) {
      toast.error("Please invite at least one member.");
      return false;
    }

    const membersWithRole: CompanyMember[] = invitedMembers.map((email) => ({
      email,
      role: "Member",
      status: "pending",
      invitedAt: new Date(),
    }));
    setIsOpenModal(true);
    const companyData: Company = {
      companyName: companyName,
      description: companyDescription,
      members: membersWithRole,
    };
    const response = await api.post("/admin/companyDetails", companyData);
    if (response.status == 200) {
      if (response.status === 200) {
        setTimeout(() => {
          dispatch(setAdminCredentials(response.data));
          setIsOpenModal(false);
        }, 3000);
      }
    }
  };
  const handleAddMember = async () => {
    if (!memberEmail || !/^\S+@\S+\.\S+$/.test(memberEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (invitedMembers.includes(memberEmail)) {
      toast.error("This email is already added.");
      return;
    }

    if (invitedMembers.length >= 5) {
      toast.error("You can only invite up to 5 members.");
      return;
    }
    if (memberEmail) {
      setIsSending(true); // Start sending invite

      try {
        setInvitedMembers([...invitedMembers, memberEmail]); // Add to the list
        setInviteMessage("send an Invite to Join ProjecX "); // Success message
        setMemberEmail(""); // Clear the input field
      } catch (error) {
        console.error(error);
        setInviteMessage("Failed to send the invite."); // Error message
      } finally {
        setIsSending(false); // Stop loading state
      }
    }
  };

  const handleRemoveMember = (index: any) => {
    setInvitedMembers(invitedMembers.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Multi-Step Modal */}
      {!adminInfo?.companyId && (
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
                {adminInfo?.firstName || "Your Company"}
              </p>
            </div>

            {/* Center Section: Steps */}
            <div className="flex flex-col justify-center items-center h-full">
              {step === 1 && (
                <div className="text-center">
                  <h2 className="text-lg font-bold mb-4">Company Name</h2>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                  />
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Next
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="text-center">
                  <h2 className="text-lg font-bold mb-4">
                    Company Description
                  </h2>
                  <input
                    type="text"
                    placeholder="Enter company description"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                  />
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 bg-gray-300 text-black rounded"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <h2 className="text-lg font-bold mb-4">Invite Members</h2>

                  {/* Input with tags and add button */}
                  <div className="flex flex-wrap items-center mb-4 border rounded-md px-3 py-2  min-h-[80px] lg:min-w-[400px] min-w-[200px]">
                    {/* Display invited members as tags */}
                    {invitedMembers.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-200 text-gray-700 rounded-full px-3 py-1 mr-2 mb-2"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="text-red-500 ml-2 font-bold focus:outline-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {/* Input Field */}
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="Enter email"
                      className="flex-grow text-xl h-[60px] border-none outline-none focus:ring-0"
                    />
                    {/* Add Button */}
                    <button
                      type="button"
                      className="ml-2 bg-indigo-600 text-white rounded-md px-4 py-2"
                      onClick={handleAddMember}
                      disabled={isSending || !memberEmail.trim()}
                    >
                      {isSending ? "Adding..." : "+"}
                    </button>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 bg-gray-300 text-black rounded"
                    >
                      Back
                    </button>
                    <button
                      onClick={submitDetails}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Finish
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(step / 3) * 100}%`, // Dynamically calculate width for progress
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white h-[90vh] w-[90vw] max-w-3xl p-8 rounded-lg shadow-xl relative overflow-hidden">
            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold flex items-center">
                Projec<span className="text-[#00A3FF]"></span>
                <span className="text-[#00A3FF]">-X</span>
              </span>
            </div>

            {/* Top Right: Welcome Message */}

            <div className="absolute top-4 right-4 text-right">
              <h2 className="text-lg font-bold">Welcome!</h2>
              <p className="text-gray-500">
                {adminInfo?.firstName || "Your Company"}
              </p>
            </div>

            <div className="flex justify-center mb-4 mt-20">
              <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00A3FF] via-[#FF9E00] to-[#FF1C68]">
                Projec-X is sending invitations to the following members
              </p>
            </div>
            <div className="flex justify-center mb-4">
              <div className="flex flex-col items-start mb-4">
                {invitedMembers.map((email, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <MailIcon className="h-5 w-5 text-[#00A3FF] mr-2" />{" "}
                    {/* Mail icon */}
                    <p className="text-lg text-gray-800">{email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar toggle button (visible only on mobile) */}
      {adminInfo?.companyId && (
        <>
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
            className={`z-40 inset-y-0 left-0 transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-1"
            } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[4.5%] bg-white shadow-md md:shadow-none`}
          >
            <AdminLeftNavBar />
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
            <AdminProjectSidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      {adminInfo?.companyId && (
        <div
          className={`flex-1 bg-[#EDEDFF] ${
            isSidebarOpen ? "hidden md:block" : "block"
          } transition-all duration-300 ease-in-out`}
        >
          <AdminRightComponent onTabSelect={setActiveTab} socket={socket} />

          {/* Dashboard or Component */}
          <div className="hide-scrollbar h-full overflow-auto p-4">
            {activeTab === "dashboard" && <AdminDashboard />}
            {activeTab === "tasks" && <AdminTaskDetails socket={socket} />}
            {activeTab === "notifications" && (
              <Notifications notifications={notifications} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
