import React, { useState } from "react";
import { Project, UserManagementProps } from "../apiTypes/apiTypes";
import "../css/tailwind.css";

const UserManagementProjectbar: React.FC<UserManagementProps> = ({
  projects,
  setSelectedProject,
  onProjectSelect,
}) => {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    onProjectSelect(project);
  };

  const handleMouseEnter = (projectId: string) => {
    setHoveredProject(projectId); // Show full message when mouse hovers
  };

  const handleMouseLeave = () => {
    setHoveredProject(null); // Revert to truncated message when mouse leaves
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar - Scrollable */}
      <div className="bg-white shadow rounded-sm p-4 mb-4">
        <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center justify-center">
          User Management
        </button>
      </div>
      <div className="flex-1 bg-white rounded-lg p-4 overflow-y-auto reduce-scrollbar">
        <h2 className="text-lg font-semibold mb-4">All Projects</h2>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project._id}
              className="p-4 shadow rounded-lg hover:shadow-lg transition-shadow duration-300 flex items-center cursor-pointer"
              onClick={() => handleProjectClick(project)}
              onMouseEnter={() => handleMouseEnter(project._id)} // Hover to show message
              onMouseLeave={handleMouseLeave} // Hover out to hide message
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

export default UserManagementProjectbar;
