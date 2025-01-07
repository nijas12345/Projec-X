import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftStartOnRectangleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { userLogout } from "../redux/Slices/UserAuth";
import api from "../utils/axiosInstance";

const LeftNavBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/home";
  const isChat = location.pathname === "/chat";
  const isVideo = location.pathname === "/meetings";
  const handleLogout = async () => {
    let response = await api.get("/logout", {
      withCredentials: true,
    });
    if (response.status == 200) {
      navigate("/login");
      dispatch(userLogout());
    }
  };
  return (
    <div className="bg-white h-screen text-gray-800 flex flex-col items-center py-4 border-r border-gray-300 fixed left-0 top-0">
      {/* Logo */}
      <img
        src="/images/projectIcon.png"
        alt="Project Logo"
        className=" w-8 h-10 "
      />

      {/* Horizontal Line Below Logo */}
      <div className="w-full border-t border-gray-300 my-4"></div>

      {/* Home Icon */}
      <div className="mb-4 flex flex-col items-center group relative cursor-pointer">
        <div className="flex flex-col items-center group-hover:bg-[#EDEDFF] group-hover:rounded-md p-2 transition-all">
          <HomeIcon
            onClick={() => {
              navigate("/home");
            }}
            className={`h-6 w-6 ${
              isHome ? "stroke-[#5453AB]" : "stroke-gray-600"
            } group-hover:stroke-[#5453AB]`}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Chat Icon */}
      <div className="mb-4 flex flex-col items-center group relative cursor-pointer">
        <div className="flex flex-col items-center group-hover:bg-[#EDEDFF] group-hover:rounded-md p-2 transition-all">
          <ChatBubbleLeftRightIcon
            onClick={() => {
              navigate("/chat");
            }}
            className={`h-6 w-6 ${
              isChat ? "stroke-[#5453AB]" : "stroke-gray-600"
            } group-hover:stroke-[#5453AB]`}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Ellipsis Icon */}
      <div className="mb-4 flex flex-col items-center group relative cursor-pointer">
        <div className="flex flex-col items-center group-hover:bg-[#EDEDFF] group-hover:rounded-md p-2 transition-all">
          <VideoCameraIcon
            onClick={() => {
              navigate("/meetings");
            }}
            className={`h-6 w-6 ${
              isVideo ? "stroke-[#5453AB]" : "stroke-gray-600"
            } group-hover:stroke-[#5453AB]`}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Logout Icon */}
      <div className="mt-auto mb-4 flex flex-col items-center group relative cursor-pointer">
        <div
          className="flex flex-col items-center group-hover:bg-[#EDEDFF] group-hover:rounded-md p-2 transition-all"
          onClick={handleLogout}
        >
          <ArrowLeftStartOnRectangleIcon
            className="h-6 w-6 stroke-gray-600 group-hover:stroke-[#5453AB]"
            strokeWidth={1.5}
          />
          <span className="mt-2 text-sm text-gray-600 font-mullish group-hover:text-[#5453AB]">
            Logout
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeftNavBar;
