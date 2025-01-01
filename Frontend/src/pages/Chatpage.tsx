import ProjectChatbar from "../components/chatProject";
import LeftNavBar from "../components/user-left-nav";
import ChatPageRight from "../components/chatRightBar";
import api from "../utils/axiosInstance";
import { useEffect, useState } from "react";
import { Message, Project, ProjectSidebarProps } from "../apiTypes/apiTypes";
import { toast } from "react-toastify";
import { userLogout } from "../redux/Slices/UserAuth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Bars3Icon } from "@heroicons/react/24/solid";

const ChatPage: React.FC<ProjectSidebarProps> = ({ initialProjects = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const fetchProjects = async () => {
    try {
      const response = await api.get("/get-projects/chat");
      console.log(response);

      if (response.data) {
        const transformedProjects = response.data.map((item: any) => ({
          ...item._doc, // Spread the project details from _doc
          latestMessage: item.latestMessage || null, // Attach the latestMessage
        }));
        setProjects(transformedProjects);
      } else {
        setError("No projects found.");
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
    } finally {
      setLoading(false);
    }
  };
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setIsSidebarOpen(false);
  };
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
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

      <div
        className={` z-40 inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-1"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[4.5%] bg-white shadow-md md:shadow-none`}
      >
        <LeftNavBar />
      </div>

      {/* ProjectChatbar */}
      <div
        className={`fixed z-20 inset-y-0 lg:left-[0.3%] left-[15%] transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[22%] bg-white shadow-md md:shadow-none`}
        style={{
          width: isSidebarOpen ? "85%" : "22%",
        }}
      >
        <div
          className={`fixed z-20 inset-y-0 lg:left-[0.3%]  transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[22%] bg-white shadow-md md:shadow-none`}
          style={{
            width: isSidebarOpen ? "100%" : "100%",
          }}
        >
          <ProjectChatbar
            projects={projects}
            setSelectedProject={setSelectedProject}
            onProjectSelect={handleProjectSelect}
          />
        </div>
      </div>
      <div className={`flex-1 ml-10 sm:ml-0  `}>
        <ChatPageRight
          selectedProject={selectedProject}
          fetchProjects={fetchProjects}
        />
      </div>
    </div>
  );
};

export default ChatPage;
