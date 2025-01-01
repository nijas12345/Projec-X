import api from "../utils/axiosInstance";
import { useEffect, useState } from "react";
import { Project, ProjectSidebarProps } from "../apiTypes/apiTypes";
import UserManagementRight from "../components/usermanagement-rightbar";
import UserManagementProjectbar from "../components/userManagement-mid";
import AdminLeftNavBar from "../components/admin-left-nav";
import { Bars3Icon } from "@heroicons/react/24/solid";

const UserManagement: React.FC<ProjectSidebarProps> = ({
  initialProjects = [],
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const fetchProjects = async () => {
    try {
      const response = await api.get("/admin/get-projects");
      console.log("projec", response);

      if (response.data !== null) {
        setProjects(response.data);
      }
    } catch (error) {
      console.log(error, "failed to load projects");
    }
  };
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);

    setIsSidebarOpen(!setIsSidebarOpen);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex h-screen overflow-y-hidden">
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
        className={` z-20 inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-1"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[4.5%] bg-white shadow-md md:shadow-none`}
      >
        <AdminLeftNavBar />
      </div>
      <div
        className={`fixed z-20 inset-y-0 lg:left-[0.3%]  transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-[22%] bg-white shadow-md md:shadow-none`}
        style={{
          width: isSidebarOpen ? "100%" : "22%",
        }}
      >
        {" "}
        <UserManagementProjectbar
          projects={projects}
          setSelectedProject={setSelectedProject}
          onProjectSelect={handleProjectSelect}
        />
      </div>

      <div className="flex-1 ml-12 sm:ml-0">
        <UserManagementRight
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          fetchProjects={fetchProjects}
        />
      </div>
    </div>
  );
};

export default UserManagement;
