import ProjectChatbar from "../components/chatProject";
import api from "../utils/axiosInstance";
import { useEffect, useState } from "react";
import { Project, ProjectSidebarProps } from "../apiTypes/apiTypes";
import AdminLeftNavBar from "../components/admin-left-nav";
import AdminChatPageRight from "../components/AdminChatRightBar";
import { Bars3Icon } from "@heroicons/react/24/solid";

const AdminChatPage: React.FC<ProjectSidebarProps> = ({
  initialProjects = [],
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setIsSidebarOpen(false);
  };
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const fetchProjects = async () => {
    try {
      const response = await api.get("/admin/get-projects/chat");
      if (response.data) {
        const transformedProjects = response.data.map((item: any) => ({
          ...item._doc, // Spread the project details from _doc
          latestMessage: item.latestMessage || null, // Attach the latestMessage
        }));
        setProjects(transformedProjects);
      } else {
        setError("No projects found.");
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      setError("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex h-screen">
      {/* LeftNavBar */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 w-12 h-10 left-0 z-50 p-0 bg-[#EDEDFF] rounded shadow-md md:hidden"
      >
        <Bars3Icon className="w-6 h-6 ml-3 text-gray-600" />
      </button>
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
        <AdminLeftNavBar />
      </div>

      <div
        className={`fixed z-20 inset-y-0 lg:left-[0.3%] left-[15%] transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[22%] bg-white shadow-md md:shadow-none`}
        style={{
          width: isSidebarOpen ? "85%" : "22%",
        }}
      >
        {" "}
        <ProjectChatbar
          projects={projects}
          setSelectedProject={setSelectedProject}
          onProjectSelect={handleProjectSelect}
        />
      </div>
      <div className="flex-1 ml-10 sm:ml-0    ">
        <AdminChatPageRight
          selectedProject={selectedProject}
          fetchProjects={fetchProjects}
        />
      </div>
    </div>
  );
};

export default AdminChatPage;
