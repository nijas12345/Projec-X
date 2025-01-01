import React, { useEffect, useState } from "react";
import { Plus, Mail } from "lucide-react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { UserData, Project, ProjectSidebarProps } from "../apiTypes/apiTypes";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import "../css/tailwind.css";
import { userLogout } from "../redux/Slices/UserAuth";
import { useNavigate } from "react-router-dom";

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  initialProjects = [],
}) => {
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/get-projects");
        if (response.data !== null) {
          setProjects(response.data);
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
    fetchProjects();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="bg-white shadow rounded-sm p-4 mb-4">
        <div className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center justify-center">
          HI {userInfo?.firstName.toUpperCase()}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg p-4 overflow-y-auto reduce-scrollbar">
        <h2 className="text-lg font-semibold mb-4">All Projects</h2>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project._id}
              className="p-4 shadow rounded-lg hover:shadow-lg transition-shadow duration-300 flex items-center cursor-pointer"
            >
              <div>
                <h3 className="font-medium">{project.name}</h3>

                <p className="text-sm text-gray-500 italic">
                  {project.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectSidebar;
